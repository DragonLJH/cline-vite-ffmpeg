// Electron preload API 类型定义
type ThemeType = 'light' | 'dark'

interface ElectronAPI {
  // 系统信息
  platform: string
  version: string

  // 窗口控制
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  toggleMaximize: () => void
  openWindow: (path: string, title: string) => void

  // 文件操作
  openFileDialog: (options?: {
    title?: string
    filters?: Array<{ name: string; extensions: string[] }>
    properties?: string[]
  }) => Promise<string[] | null>

  saveFileDialog: (options?: {
    title?: string
    filters?: Array<{ name: string; extensions: string[] }>
    defaultPath?: string
  }) => Promise<string | null>

  // 通知
  showNotification: (options: {
    title: string
    body: string
    icon?: string
  }) => void

  // 剪贴板
  clipboard: {
    readText: () => string
    writeText: (text: string) => void
  }
  
  // 文件操作
  readFile: (filePath: string) => Promise<{ buffer: string; fileName: string }>

  // FFmpeg 处理
  ffmpeg: {
    // 转码（完整能力）
    run: (params: any) => Promise<{ taskId: string; success: boolean; error?: string }>
    
    // 截图（快速模式）
    screenshot: (input: string, time: string, output: string) => Promise<{ taskId: string; success: boolean; error?: string }>
    
    // 精确截图
    screenshotAccurate: (input: string, time: string, output: string) => Promise<{ taskId: string; success: boolean; error?: string }>
    
    // 裁剪视频
    cut: (input: string, output: string, start: string, duration: string, precise?: boolean) => Promise<{ taskId: string; success: boolean; error?: string }>
    
    // 添加视频水印
    addWatermark: (input: string, output: string, watermarkImage: string, x?: number, y?: number) => Promise<{ taskId: string; success: boolean; error?: string }>
    
    // 进度监听
    onProgress: (callback: (data: any) => void) => () => void
    
    // 音频相关（保留原有方法）
    checkAudioMetadata: (filePath: string) => Promise<{ hasCover: boolean }>
    extractAudioCover: (filePath: string) => Promise<string | null>
    extractVideoThumbnail: (filePath: string) => Promise<string | null>
  }

  // 路径相关
  paths: {
    /** 获取默认输出文件路径 */
    getDefaultOutputPath: (prefix?: string, extension?: string) => Promise<string>
    /** 获取默认输出目录 */
    getDefaultOutputDir: () => Promise<string>
    /** 获取所有应用路径 */
    getAppPaths: () => Promise<Record<string, string>>
  }

  // 应用信息
  appInfo: {
    name: string
    version: string
    isDev: boolean
  }

  // 主题同步
  broadcastThemeChange: (theme: ThemeType) => void

  // 语言同步
  broadcastLanguageChange: (language: string) => void

  // 登录状态同步
  broadcastLoginSuccess: (userData: any) => Promise<boolean>
  onLoginSuccess: (callback: (userData: any) => void) => void

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void
  off: (channel: string, callback: (...args: any[]) => void) => void
  once: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export { }
