import { create } from 'zustand'

// 水印类型
type WatermarkType = 'image' | 'text'

// 基础水印接口
interface BaseWatermarkItem {
  id: string                    // 唯一标识
  type: WatermarkType           // 水印类型
  position: { x: number; y: number }  // 位置坐标
  opacity: number               // 透明度 (0-100)
  startTime: number             // 开始时间（秒）
  endTime: number               // 结束时间（秒）
}

// 图片水印
interface ImageWatermarkItem extends BaseWatermarkItem {
  type: 'image'
  image: File | null            // 水印图片
  size: number                  // 大小百分比 (10-200)
}

// 文字水印
interface TextWatermarkItem extends BaseWatermarkItem {
  type: 'text'
  text: string                  // 文字内容
  fontSize: number              // 字体大小 (12-120)
  fontColor: string             // 字体颜色 (如: '#FFFFFF', 'white')
  fontFamily?: string           // 字体名称 (如: 'Arial', 'SimHei')
  backgroundColor?: string      // 背景颜色 (可选)
  borderWidth?: number          // 边框宽度 (可选, 0-10)
  borderColor?: string          // 边框颜色 (可选)
  shadow?: boolean              // 是否添加阴影
}

// 水印项联合类型
type WatermarkItem = ImageWatermarkItem | TextWatermarkItem

// 资源管理配置
const RESOURCE_CONFIG = {
  MAX_CONCURRENT_FFMPEG_JOBS: 1,  // 最大并发FFmpeg任务数
  MEDIA_INFO_TIMEOUT_MS: 30000,   // 获取媒体信息超时时间（毫秒）
  TEMP_FILE_PREFIX: 'temp_watermark_', // 临时文件前缀
}

// 清理临时文件的辅助函数
const cleanupTempFiles = async (filePaths: string[]) => {
  if (!filePaths || filePaths.length === 0) return

  console.log('[WatermarkStore] Cleaning up temp files:', filePaths)

  for (const filePath of filePaths) {
    try {
      // 使用Node.js fs模块删除文件（通过Electron的IPC）
      // 注意：这里需要通过IPC调用主进程来删除文件
      // 由于我们在渲染进程中，不能直接使用fs模块
      // 我们可以通过一个简单的IPC调用来删除文件
      console.log('[WatermarkStore] Would delete temp file:', filePath)
      // 暂时只记录日志，实际删除逻辑需要在主进程实现
    } catch (error) {
      // 忽略删除失败的错误（文件可能不存在）
      console.warn('[WatermarkStore] Failed to delete temp file:', filePath, error)
    }
  }
}

// 视频信息接口
interface VideoInfo {
  duration: number              // 视频时长（秒）
  width: number                 // 视频宽度
  height: number                // 视频高度
  fps: number                   // 帧率
  bitrate: string               // 比特率
}

interface WatermarkState {
  selectedFile: File | null
  watermarks: WatermarkItem[]   // 多水印数组
  videoInfo: VideoInfo | null   // 视频信息
  outputDir: string | null     // 输出目录
  outputFileName: string | null // 输出文件名
  processedFile: File | null
  processedFilePath: string | null  // 处理后的文件路径
  isProcessing: boolean
  progress: number
  initStore: () => Promise<void>
  setSelectedFile: (file: File | null) => void
  setVideoInfo: (info: VideoInfo | null) => void
  addWatermark: (watermark: Omit<WatermarkItem, 'id'>) => void
  updateWatermark: (id: string, updates: Partial<WatermarkItem>) => void
  removeWatermark: (id: string) => void
  setOutputDir: (dir: string) => void
  setOutputFileName: (name: string) => void
  processWatermarks: () => Promise<void>
  resetState: () => void
}

// 生成唯一 ID
const generateId = (): string => {
  return `watermark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
function time2sec(time: string) {
  const times = time.split(':')
  if (times.length == 3) {
    const hour = Number(times[0])
    const min = Number(times[1])
    const sec = Number(times[2])
    return Number(hour * 3600) + Number(min * 60) + Number(sec)
  } else {
    const min = Number(times[0])
    const sec = Number(times[1])
    return Number(min * 60) + Number(sec)
  }
}

export const useWatermarkStore = create<WatermarkState>((set, get) => ({
  selectedFile: null,
  watermarks: [],
  videoInfo: null,
  outputDir: null,
  outputFileName: null,
  processedFile: null,
  processedFilePath: null,
  isProcessing: false,
  progress: 0,

  initStore: async () => {
    console.log('[WatermarkStore] initStore called')
    try {
      console.log('[WatermarkStore] Getting default output dir from main process...')
      const defaultDir = await window.electronAPI.paths.getDefaultOutputDir()
      console.log('[WatermarkStore] Got default output dir:', defaultDir)
      set({ outputDir: defaultDir })
    } catch (error) {
      console.error('[WatermarkStore] Failed to get default output dir:', error)
    }
  },

  setSelectedFile: (file: File | null) => {
    console.log('[WatermarkStore] setSelectedFile called with:', file?.name)
    set({ selectedFile: file })
    // 自动生成默认文件名
    if (file) {
      const defaultFileName = `watermarked_${file.name}`
      console.log('[WatermarkStore] Setting default filename:', defaultFileName)
      set({ outputFileName: defaultFileName })

      // 读取视频信息（带超时机制）
      const filePath = (file as any).path || file.name

      // 创建超时Promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('获取媒体信息超时'))
        }, RESOURCE_CONFIG.MEDIA_INFO_TIMEOUT_MS)
      })
      // 竞争：获取媒体信息 vs 超时
      Promise.race([
        window.electronAPI.ffmpeg.getMediaInfo(filePath),
        timeoutPromise
      ]).then((info: any) => {
        console.log('[WatermarkStore] Video info loaded:', info)
        set({
          videoInfo: {
            duration: time2sec(info.duration) || 0,
            width: info.streams?.[0]?.width || 0,
            height: info.streams?.[0]?.height || 0,
            fps: info.streams?.[0]?.fps || 0,
            bitrate: info.bitrate || '0'
          }
        })
      }).catch((error) => {
        console.error('[WatermarkStore] Failed to get video info:', error)
        // 设置默认值，避免UI卡住
        set({
          videoInfo: {
            duration: 0,
            width: 0,
            height: 0,
            fps: 0,
            bitrate: '0'
          }
        })
      })
    }
    console.log('[WatermarkStore] selectedFile updated:', get().selectedFile?.name)
  },

  setVideoInfo: (info: VideoInfo | null) => {
    console.log('[WatermarkStore] setVideoInfo called with:', info)
    set({ videoInfo: info })
  },

  addWatermark: (watermark: Omit<WatermarkItem, 'id'>) => {
    const id = generateId()
    console.log('[WatermarkStore] addWatermark called with:', watermark)
    set((state) => ({
      watermarks: [...state.watermarks, { ...watermark, id } as WatermarkItem]
    }))
  },

  updateWatermark: (id: string, updates: Partial<WatermarkItem>) => {
    console.log('[WatermarkStore] updateWatermark called with:', id, updates)
    set((state) => ({
      watermarks: state.watermarks.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      )
    }))
  },

  removeWatermark: (id: string) => {
    console.log('[WatermarkStore] removeWatermark called with:', id)
    set((state) => ({
      watermarks: state.watermarks.filter((w) => w.id !== id)
    }))
  },

  setOutputDir: (dir: string) => {
    console.log('[WatermarkStore] setOutputDir called with:', dir)
    set({ outputDir: dir })
  },

  setOutputFileName: (name: string) => {
    console.log('[WatermarkStore] setOutputFileName called with:', name)
    set({ outputFileName: name })
  },

  processWatermarks: async () => {
    const { selectedFile, watermarks, outputDir, outputFileName } = get()

    if (!selectedFile || watermarks.length === 0 || !outputDir || !outputFileName) {
      console.error('[WatermarkStore] Missing required files or output path')
      return
    }

    // 检查是否有其他正在处理的任务（资源限制）
    if (get().isProcessing) {
      console.warn('[WatermarkStore] Another processing task is already running')
      return
    }

    set({ isProcessing: true, progress: 0 })

    // 设置进度监听器
    const unsubscribe = window.electronAPI.ffmpeg.onProgress((data) => {
      console.log('[WatermarkStore] Progress received:', data)
      if (data.progress?.percent !== undefined) {
        set({ progress: Math.round(data.progress.percent) })
      }
    })

    try {
      // 获取输入文件路径
      const inputPath = (selectedFile as any).path || selectedFile.name

      // 拼接完整输出路径
      const separator = outputDir.endsWith('/') || outputDir.endsWith('\\') ? '' : '/'
      const finalOutputPath = `${outputDir}${separator}${outputFileName}`

      // 构建多水印参数数组
      const watermarkParams = watermarks.map((watermark) => {
        const baseParams = {
          type: watermark.type,
          x: watermark.position.x,
          y: watermark.position.y,
          start: watermark.startTime.toString(),
          end: watermark.endTime.toString(),
          opacity: watermark.opacity
        }

        if (watermark.type === 'image') {
          const watermarkImagePath = (watermark.image as any).path || watermark.image?.name
          return {
            ...baseParams,
            image: watermarkImagePath,
            size: watermark.size
          }
        } else {
          // 文字水印
          return {
            ...baseParams,
            text: watermark.text,
            fontSize: watermark.fontSize,
            fontColor: watermark.fontColor,
            fontFamily: watermark.fontFamily,
            backgroundColor: watermark.backgroundColor,
            borderWidth: watermark.borderWidth,
            borderColor: watermark.borderColor,
            shadow: watermark.shadow
          }
        }
      }).filter(wm => {
        if (wm.type === 'image') {
          return !!(wm as any).image
        }
        return !!(wm as any).text
      })

      console.log('[WatermarkStore] Processing all watermarks in one call:', {
        input: inputPath,
        output: finalOutputPath,
        watermarkCount: watermarkParams.length,
        watermarks: watermarkParams
      })

      // 使用新的多水印 API 一次性处理所有水印
      const result = await window.electronAPI.ffmpeg.addWatermarks(
        inputPath,
        finalOutputPath,
        watermarkParams
      )

      if (!result.success) {
        throw new Error(result.error || 'Watermark processing failed')
      }

      console.log('[WatermarkStore] All watermarks processed successfully')

      // 使用返回的输出路径
      const outputPath = result.outputPath || finalOutputPath
      console.log('[WatermarkStore] Processed file saved to:', outputPath)
      
      // 直接保存文件路径，不需要将文件读入内存
      set({
        processedFile: new File([''], outputFileName, { type: 'video/mp4' }),
        processedFilePath: outputPath,
        isProcessing: false,
        progress: 100
      })

    } catch (error) {
      console.error('[WatermarkStore] Watermark processing failed:', error)
      set({ isProcessing: false, progress: 0 })
    } finally {
      // 移除进度监听器
      unsubscribe()
    }
  },

  resetState: () => {
    set({
      selectedFile: null,
      watermarks: [],
      videoInfo: null,
      outputDir: null,
      outputFileName: null,
      processedFile: null,
      processedFilePath: null,
      isProcessing: false,
      progress: 0
    })
  }
}))

// 导出类型供其他模块使用
export type {
  WatermarkType,
  BaseWatermarkItem,
  ImageWatermarkItem,
  TextWatermarkItem,
  WatermarkItem,
  VideoInfo
}