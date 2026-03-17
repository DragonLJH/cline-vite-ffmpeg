import { BrowserWindow, app } from 'electron'
import * as path from 'path'

/**
 * 广播事件到窗口
 * @param eventName 事件名
 * @param data 传递的数据
 * @param includeSender 是否包含发送者窗口
 * @param event IPC 事件对象（用于自动获取和验证发送者窗口）
 */
export function broadcastToWindows(eventName: string, data?: any, includeSender: boolean = false, event?: Electron.IpcMainEvent) {
  const allWindows = BrowserWindow.getAllWindows()
  let senderWindow: BrowserWindow | null = null

  // 如果提供了 event，获取并验证发送者窗口
  if (event) {
    senderWindow = BrowserWindow.fromWebContents(event.sender)
    if (!senderWindow) return // 发送者窗口无效，直接返回
  }

  console.log('[broadcastToWindows]', data)
  allWindows.forEach(window => {
    if (!window.isDestroyed()) {
      if (!includeSender && senderWindow && window.id === senderWindow.id) {
        return // 跳过发送者
      }
      window.webContents.send(eventName, data)
    }
  })
}

/**
 * 通用 URL 加载函数
 * @param window 要加载的窗口
 * @param routePath 路由路径（可选，用于新窗口）
 * @param isNewWindow 是否为新窗口
 */
export async function loadWindowURL(window: BrowserWindow, routePath?: string, isNewWindow: boolean = false): Promise<void> {
  // 开发模式加载 Vite 服务器，生产模式加载打包文件
  if (process.env.NODE_ENV === 'development') {
    let url = 'http://localhost:5173'
    if (routePath && isNewWindow) {
      // 对于HashRouter，需要使用 #/path 格式
      const hashPath = routePath === '/' ? '' : routePath
      url += `/#${hashPath}?newwindow=true`
    }
    await window.loadURL(url)
  } else {
    // 在生产模式下，从应用目录加载 index.html
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    let fileUrl = `file://${indexPath.replace(/\\/g, '/')}`
    if (routePath && isNewWindow) {
      const hashPath = routePath === '/' ? '' : routePath
      fileUrl += `#${hashPath}?newwindow=true`
    }
    await window.loadURL(fileUrl)
  }
}
