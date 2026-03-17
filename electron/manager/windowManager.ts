import { BrowserWindow, app } from 'electron'
import * as path from 'path'
import { loadWindowURL } from '../utils'

/**
 * 窗口选项接口
 */
export interface WindowOptions {
  width?: number
  height?: number
  title?: string
  isMainWindow?: boolean
  routePath?: string // 用于新窗口的路由路径
  parent?: BrowserWindow
}

/**
 * 通用窗口创建函数
 * @param options 窗口选项
 * @returns 创建的窗口实例
 */
export function createBrowserWindow(options: WindowOptions): BrowserWindow {
  // 获取 preload 脚本路径
  const preloadPath = path.join(app.getAppPath(), 'dist', 'electron', 'preload.js')

  // 根据平台配置窗口选项
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: options.width || 1200,
    height: options.height || 800,
    title: options.title,
    parent: options.parent,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    // Windows 平台使用自定义标题栏
    ...(process.platform === 'win32' && {
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: false
    }),
    // macOS 保留原生标题栏
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'hiddenInset'
    }),
    // Linux 根据需要配置
    ...(process.platform === 'linux' && {
      frame: true
    })
  }

  const window = new BrowserWindow(windowOptions)

  // 加载 URL
  loadWindowURL(window, options.routePath, !options.isMainWindow)

  // 开发模式打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    window.webContents.openDevTools()
  }

  return window
}