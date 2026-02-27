import { create } from 'zustand'

interface WatermarkState {
  selectedFile: File | null
  processedFile: File | null
  isProcessing: boolean
  progress: number
  addWatermark: (file: File, config: WatermarkConfig) => Promise<void>
  resetState: () => void
}

interface WatermarkConfig {
  text: string
  position: string
  opacity: number
  size: number
}

export const useWatermarkStore = create<WatermarkState>((set, get) => ({
  selectedFile: null,
  processedFile: null,
  isProcessing: false,
  progress: 0,

  addWatermark: async (file: File, config: WatermarkConfig) => {
    set({ isProcessing: true, progress: 0 })
    
    try {
      // 这里应该调用 Electron API 来处理视频文件
      // 模拟处理过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        set({ progress: i })
      }
      
      // 模拟处理完成
      set({ 
        processedFile: file, // 这里应该是处理后的文件
        isProcessing: false 
      })
    } catch (error) {
      console.error('Watermark processing failed:', error)
      set({ isProcessing: false, progress: 0 })
    }
  },

  resetState: () => {
    set({
      selectedFile: null,
      processedFile: null,
      isProcessing: false,
      progress: 0
    })
  }
}))