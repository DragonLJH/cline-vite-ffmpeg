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

export {}
