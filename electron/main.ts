import { app, BrowserWindow, protocol } from 'electron'
import { ipcHandlerManager, createBrowserWindow } from './manager'
import { appConfig } from './config'
import * as fs from 'fs'
import * as path from 'path'

let mainWindow: BrowserWindow

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = createBrowserWindow({
    width: appConfig.windows.main.width,
    height: appConfig.windows.main.height,
    title: appConfig.windows.main.title,
    isMainWindow: true
  })
}

// 注册所有 IPC 通道
ipcHandlerManager.registerAllChannels()

// 应用生命周期事件
app.whenReady().then(() => {
  // 注册自定义协议 local-file:// 用于访问本地文件
  // 使用现代的 protocol.handle API (Electron 25+)
  protocol.handle('local-file', async (request) => {
    try {
      // 解析URL
      const url = new URL(request.url)
      // 获取pathname并解码（处理中文、空格等特殊字符）
      let filePath = decodeURIComponent(url.pathname)

      // 在Windows上，pathname会以/开头，如 /C:/Users/...
      // 需要移除这个前导斜杠
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.substring(1)
      }

      // 将路径中的斜杠转换为平台特定的分隔符
      const normalizedPath = process.platform === 'win32'
        ? filePath.replace(/\//g, '\\')
        : filePath

      console.log('[local-file protocol] Requested file:', normalizedPath)

      // 检查文件是否存在
      if (!fs.existsSync(normalizedPath)) {
        console.error('[local-file protocol] File not found:', normalizedPath)
        return new Response('File not found', { status: 404 })
      }

      // 读取文件内容
      const fileBuffer = fs.readFileSync(normalizedPath)

      // 根据文件扩展名确定MIME类型
      const ext = path.extname(normalizedPath).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.mkv': 'video/x-matroska',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }
      const contentType = mimeTypes[ext] || 'application/octet-stream'

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString()
        }
      })
    } catch (error) {
      console.error('[local-file protocol] Error handling request:', error)
      return new Response('Internal server error', { status: 500 })
    }
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
