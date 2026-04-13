import { contextBridge, ipcRenderer } from 'electron'
import { WatermarkItem } from './ffmpeg/FFmpegCommandBuilder'

// 自定义 API 接口定义
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
  broadcastThemeChange: (theme: 'light' | 'dark') => void

  // 语言同步
  broadcastLanguageChange: (language: string) => void

  // 登录状态同步
  broadcastLoginSuccess: (userData: any) => Promise<boolean>
  onLoginSuccess: (callback: (userData: any) => void) => void

  // 文件操作
  readFile: (filePath: string) => Promise<{ buffer: string; fileName: string }>

  // FFmpeg 处理
  ffmpeg: {
    run: (params: any) => void
    screenshot: (input: string, time: string, output: string) => void
    screenshotAccurate: (input: string, time: string, output: string) => void
    cut: (input: string, output: string, start: string, duration: string, precise?: boolean) => void
    addWatermark: (input: string, output: string, watermarkImage: string, x?: number, y?: number) => void
    addWatermarks: (input: string, output: string, watermarks: WatermarkItem[]) => void
    getMediaInfo: (input: string) => Promise<any>
    onProgress: (callback: (data: any) => void) => void
  }

  // 路径相关
  paths: {
    getDefaultOutputPath: (prefix?: string, extension?: string) => Promise<string>
    getDefaultOutputDir: () => Promise<string>
    getAppPaths: () => Promise<Record<string, string>>
  }


  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void
  off: (channel: string, callback: (...args: any[]) => void) => void
  once: (channel: string, callback: (...args: any[]) => void) => void
}

// 安全的 API 实现
const electronAPI: ElectronAPI = {
  // 系统信息
  platform: process.platform,
  version: process.versions.electron,

  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  openWindow: (path: string, title: string) => ipcRenderer.invoke('window:open', path, title),

  // 文件对话框
  openFileDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),

  // 通知
  showNotification: (options) => ipcRenderer.invoke('notification:show', options),

  // 剪贴板
  clipboard: {
    readText: () => ipcRenderer.sendSync('clipboard:readText'),
    writeText: (text: string) => ipcRenderer.invoke('clipboard:writeText', text)
  },

  // 文件操作
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

  // FFmpeg 处理
  ffmpeg: {
    // 转码（完整能力）
    run: (params: any) => ipcRenderer.invoke("ffmpeg:run", params),
    
    // 截图（快速模式）
    screenshot: (input: string, time: string, output: string) => 
      ipcRenderer.invoke("ffmpeg:screenshot", input, time, output),
    
    // 精确截图
    screenshotAccurate: (input: string, time: string, output: string) => 
      ipcRenderer.invoke("ffmpeg:screenshotAccurate", input, time, output),
    
    // 裁剪视频
    cut: (input: string, output: string, start: string, duration: string, precise?: boolean) => 
      ipcRenderer.invoke("ffmpeg:cut", input, output, start, duration, precise),
    
    // 添加视频水印
    addWatermark: (input: string, output: string, watermarkImage: string, x?: number, y?: number, startTime?: string, endTime?: string, size?: number) => 
      ipcRenderer.invoke("ffmpeg:addWatermark", input, output, watermarkImage, x, y, startTime, endTime, size),
    
    // 添加多个视频水印（一次性处理，支持图片和文字混合）
    addWatermarks: (input: string, output: string, watermarks: WatermarkItem[]) =>
      ipcRenderer.invoke("ffmpeg:addWatermarks", input, output, watermarks),
    
    // 获取媒体信息
    getMediaInfo: (input: string) => ipcRenderer.invoke("ffmpeg:getMediaInfo", input),
    
    // 进度监听
    onProgress: (callback: (data: any) => void) => {
      const listener = (_: any, data: any) => {
        callback(data)
      }
      ipcRenderer.on("ffmpeg:progress", listener)
      // 👇 返回取消监听（很重要）
      return () => {
        ipcRenderer.removeListener("ffmpeg:progress", listener)
      }
    }
  },

  // 路径相关
  paths: {
    getDefaultOutputPath: (prefix?: string, extension?: string) => 
      ipcRenderer.invoke("paths:getDefaultOutputPath", prefix, extension),
    getDefaultOutputDir: () => ipcRenderer.invoke("paths:getDefaultOutputDir"),
    getAppPaths: () => ipcRenderer.invoke("paths:getAppPaths")
  },

  // 应用信息
  appInfo: {
    name: 'Cline Vite App',
    version: '1.0.0',
    isDev: process.env.NODE_ENV === 'development'
  },

  // 主题同步
  broadcastThemeChange: (theme: 'light' | 'dark') => ipcRenderer.send('theme:changed', theme),

  // 语言同步
  broadcastLanguageChange: (language: string) => ipcRenderer.send('language:changed', language),

  // 登录状态同步
  broadcastLoginSuccess: (userData: any) => {
    return new Promise((resolve) => {
      ipcRenderer.send('login:success', userData)
      ipcRenderer.once('login:success:back', (event) => {
        console.log('[=====broadcastLoginSuccess=====]')
        resolve(true)
      })
    })
  },
  onLoginSuccess: (callback: (userData: any) => void) => ipcRenderer.on('login:success', (event, userData) => {
    console.log('[onLoginSuccess]', event)
    event.sender.send('login:success:back')
    callback(userData)
  }),

  // 事件监听 (只允许安全的频道)
  on: (channel: string, callback: (...args: any[]) => void) => {
    // 允许的通道列表 - 包含广播通道和窗口事件
    const allowedChannels = [
      'window:maximized',
      'window:unmaximized',
      'theme:changed',
      'language:changed',
      'login:success',
      'login:success:back'
    ]
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, callback)
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    const allowedChannels = [
      'window:maximized',
      'window:unmaximized',
      'theme:changed',
      'language:changed',
      'login:success',
      'login:success:back'
    ]
    if (allowedChannels.includes(channel)) {
      ipcRenderer.off(channel, callback)
    }
  },

  once: (channel: string, callback: (...args: any[]) => void) => {
    const allowedChannels = [
      'window:maximized',
      'window:unmaximized',
      'theme:changed',
      'language:changed',
      'login:success',
      'login:success:back'
    ]
    if (allowedChannels.includes(channel)) {
      ipcRenderer.once(channel, callback)
    }
  }
}

// 将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// 类型声明 (在全局声明文件中使用)
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
