import { create } from 'zustand'

// 水印项接口
interface WatermarkItem {
  id: string                    // 唯一标识
  image: File | null            // 水印图片
  position: { x: number; y: number }  // 位置坐标
  opacity: number               // 透明度 (0-100)
  size: number                  // 大小百分比 (10-200)
  startTime: number             // 开始时间（秒）
  endTime: number               // 结束时间（秒）
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

export const useWatermarkStore = create<WatermarkState>((set, get) => ({
  selectedFile: null,
  watermarks: [],
  videoInfo: null,
  outputDir: null,
  outputFileName: null,
  processedFile: null,
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
      
      // 读取视频信息
      const filePath = (file as any).path || file.name
      window.electronAPI.ffmpeg.getMediaInfo(filePath).then((info) => {
        console.log('[WatermarkStore] Video info loaded:', info)
        set({
          videoInfo: {
            duration: parseFloat(info.duration) || 0,
            width: info.streams?.[0]?.width || 0,
            height: info.streams?.[0]?.height || 0,
            fps: info.streams?.[0]?.fps || 0,
            bitrate: info.bitrate || '0'
          }
        })
      }).catch((error) => {
        console.error('[WatermarkStore] Failed to get video info:', error)
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
      watermarks: [...state.watermarks, { ...watermark, id }]
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
      
      // 处理多个水印
      let currentInput = inputPath
      
      for (let i = 0; i < watermarks.length; i++) {
        const watermark = watermarks[i]
        const watermarkImagePath = (watermark.image as any).path || watermark.image?.name
        
        if (!watermarkImagePath) continue
        
        const isLast = i === watermarks.length - 1
        const outputPath = isLast ? finalOutputPath : `${outputDir}/temp_watermark_${i}.mp4`
        
        console.log('[WatermarkStore] Processing watermark:', {
          index: i,
          input: currentInput,
          output: outputPath,
          watermarkImage: watermarkImagePath,
          x: watermark.position.x,
          y: watermark.position.y,
          startTime: watermark.startTime,
          endTime: watermark.endTime,
          size: watermark.size
        })
        
        // 调用 Electron API
        const result = await window.electronAPI.ffmpeg.addWatermark(
          currentInput,
          outputPath,
          watermarkImagePath,
          watermark.position.x,
          watermark.position.y,
          watermark.startTime.toString(),
          watermark.endTime.toString(),
          watermark.size
        )
        
        if (!result.success) {
          throw new Error(result.error || `Watermark ${i} processing failed`)
        }
        
        // 如果不是最后一个水印，使用临时文件作为下一个水印的输入
        if (!isLast) {
          currentInput = outputPath
        }
      }
      
      console.log('[WatermarkStore] All watermarks processed successfully')
      
      // 处理成功，创建处理后的文件对象
      const processedBlob = new Blob([], { type: 'video/mp4' })
      const processedFile = new File([processedBlob], outputFileName)
      
      set({ 
        processedFile: processedFile,
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
      isProcessing: false,
      progress: 0
    })
  }
}))