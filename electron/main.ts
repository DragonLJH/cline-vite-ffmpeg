import { app, BrowserWindow } from 'electron'
import { ipcHandlerManager, createBrowserWindow } from './manager'
import { appConfig } from './config'

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
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
