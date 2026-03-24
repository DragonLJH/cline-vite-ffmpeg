import { create } from 'zustand'

interface WatermarkState {
  selectedFile: File | null
  watermarkImage: File | null  // 水印图片
  outputDir: string | null     // 输出目录
  outputFileName: string | null // 输出文件名
  processedFile: File | null
  isProcessing: boolean
  progress: number
  initStore: () => Promise<void>
  setSelectedFile: (file: File | null) => void
  setWatermarkImage: (file: File | null) => void
  setOutputDir: (dir: string) => void
  setOutputFileName: (name: string) => void
  addWatermark: (config: WatermarkConfig) => Promise<void>
  resetState: () => void
}

interface WatermarkConfig {
  text: string
  position: string
  opacity: number
  size: number
  startTime?: string  // 水印开始时间（秒）
  endTime?: string    // 水印结束时间（秒）
  x?: number  // 水印 X 坐标
  y?: number  // 水印 Y 坐标
  watermarkSize?: number  // 水印图片大小（百分比，1-100）
}

// 位置转换为坐标（使用相对位置，实际坐标由前端计算）
const getPositionCoords = (position: string): { x: number; y: number } => {
  switch (position) {
    case 'topLeft':
      return { x: 10, y: 10 }
    case 'topRight':
      return { x: 10, y: 10 }  // 前端会根据视频宽度计算实际位置
    case 'bottomLeft':
      return { x: 10, y: 10 }  // 前端会根据视频高度计算实际位置
    case 'bottomRight':
      return { x: 10, y: 10 }  // 前端会根据视频宽高计算实际位置
    case 'center':
      return { x: 10, y: 10 }  // 前端会根据视频宽高计算中心位置
    default:
      return { x: 10, y: 10 }
  }
}

export const useWatermarkStore = create<WatermarkState>((set, get) => ({
  selectedFile: null,
  watermarkImage: null,
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
    }
    console.log('[WatermarkStore] selectedFile updated:', get().selectedFile?.name)
  },

  setWatermarkImage: (file: File | null) => {
    console.log('[WatermarkStore] setWatermarkImage called with:', file?.name)
    set({ watermarkImage: file })
  },

  setOutputDir: (dir: string) => {
    console.log('[WatermarkStore] setOutputDir called with:', dir)
    set({ outputDir: dir })
  },

  setOutputFileName: (name: string) => {
    console.log('[WatermarkStore] setOutputFileName called with:', name)
    set({ outputFileName: name })
  },

  addWatermark: async (config: WatermarkConfig) => {
    const { selectedFile, watermarkImage, outputDir, outputFileName } = get()
    
    if (!selectedFile || !watermarkImage || !outputDir || !outputFileName) {
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
      const watermarkImagePath = (watermarkImage as any).path || watermarkImage.name
      
      // 获取坐标 - 优先使用传入的坐标，否则使用位置转换的坐标
      let x = config.x
      let y = config.y
      
      if (x === undefined || y === undefined) {
        const coords = getPositionCoords(config.position)
        x = coords.x
        y = coords.y
      }
      
      // 拼接完整输出路径
      const separator = outputDir.endsWith('/') || outputDir.endsWith('\\') ? '' : '/'
      const finalOutputPath = `${outputDir}${separator}${outputFileName}`
      
      console.log('[WatermarkStore] Calling addWatermark with:', {
        input: inputPath,
        output: finalOutputPath,
        watermarkImage: watermarkImagePath,
        x: x,
        y: y,
        startTime: config.startTime,
        endTime: config.endTime,
        size: config.watermarkSize
      })
      
      // 打印FFmpeg命令（用于调试）
      console.log('[WatermarkStore] FFmpeg command will be:', 
        `ffmpeg -y -i "${inputPath}" -i "${watermarkImagePath}" -filter_complex "${config.watermarkSize && config.watermarkSize !== 100 ? `[1:v]scale=iw*${config.watermarkSize/100}:ih*${config.watermarkSize/100}[wm];[0:v][wm]` : 'overlay='}${x}:${y}${config.startTime && config.endTime ? `:enable='between(t,${config.startTime},${config.endTime})'` : ''}" "${finalOutputPath}"`)

      // 调用 Electron API
      const result = await window.electronAPI.ffmpeg.addWatermark(
        inputPath,
        finalOutputPath,
        watermarkImagePath,
        x,
        y,
        config.startTime,
        config.endTime,
        config.watermarkSize
      )

      console.log('[WatermarkStore] addWatermark result:', result)
      
      if (result.success) {
        // 处理成功，创建处理后的文件对象
        const processedBlob = new Blob([], { type: 'video/mp4' })
        const processedFile = new File([processedBlob], `watermarked_${selectedFile.name}`)
        
        set({ 
          processedFile: processedFile,
          isProcessing: false,
          progress: 100
        })
      } else {
        throw new Error(result.error || 'Watermark processing failed')
      }
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
      watermarkImage: null,
      outputDir: null,
      outputFileName: null,
      processedFile: null,
      isProcessing: false,
      progress: 0
    })
  }
}))
