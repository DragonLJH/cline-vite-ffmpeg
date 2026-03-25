import { ipcMain, BrowserWindow, dialog, Notification, clipboard } from 'electron'
import { BROADCAST_CHANNELS, handleBroadcast, registerBroadcastHandlers } from './broadcastManager'
import { createBrowserWindow } from './windowManager'
import { ffmpegManager } from './ffmpegManager'
import { FFmpegProgress } from "../ffmpeg/progressParser"
import { MediaInfo } from "../services/videoService"
import { getAppPaths, getDefaultOutputPath, generateOutputFilename } from '../config'

/**
 * IPC 处理器类型定义
 */
export type IPCHandler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any | Promise<any>
export type IPCOnHandler = (event: Electron.IpcMainEvent, ...args: any[]) => void

/**
 * IPC 通道配置接口
 */
export interface IPCChannelConfig {
  handler: IPCHandler | IPCOnHandler
  type: 'handle' | 'on' | 'once'
  requiresWindow?: boolean  // 是否需要窗口焦点
}

/**
 * IPC 管理器类 - 统一管理所有 IPC 通道
 */
export class IPCHandlerManager {
  private static instance: IPCHandlerManager
  private channels: Map<string, IPCChannelConfig> = new Map()

  private constructor() {
    this.initializeChannels()
  }

  public static getInstance(): IPCHandlerManager {
    if (!IPCHandlerManager.instance) {
      IPCHandlerManager.instance = new IPCHandlerManager()
    }
    return IPCHandlerManager.instance
  }

  /**
   * 初始化所有 IPC 通道
   */
  private initializeChannels() {
    // 窗口控制
    this.addChannel('window:minimize', {
      handler: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        focusedWindow?.minimize()
      },
      type: 'handle',
      requiresWindow: true
    })

    this.addChannel('window:maximize', {
      handler: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        focusedWindow?.maximize()
      },
      type: 'handle',
      requiresWindow: true
    })

    this.addChannel('window:close', {
      handler: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        focusedWindow?.close()
      },
      type: 'handle',
      requiresWindow: true
    })

    this.addChannel('window:toggle-maximize', {
      handler: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow?.isMaximized()) {
          focusedWindow.unmaximize()
        } else {
          focusedWindow?.maximize()
        }
      },
      type: 'handle',
      requiresWindow: true
    })

    this.addChannel('window:open', {
      handler: async (event: Electron.IpcMainInvokeEvent, routePath: string, title: string) => {
        try {
          const senderWindow = BrowserWindow.fromWebContents(event.sender)
          const newWindow = createBrowserWindow({
            width: 1000,
            height: 700,
            title: title,
            routePath: routePath,
            parent: senderWindow || undefined,
            isMainWindow: false
          })

          return { success: true, windowId: newWindow.id }
        } catch (error) {
          console.error('Failed to open window:', error)
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      },
      type: 'handle'
    })

    // 文件对话框
    this.addChannel('dialog:openFile', {
      handler: async (event: Electron.IpcMainInvokeEvent, options?: any) => {
        const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
          title: options?.title || '选择文件',
          filters: options?.filters,
          properties: options?.properties || ['openFile']
        })
        return result.canceled ? null : result.filePaths
      },
      type: 'handle'
    })

    this.addChannel('dialog:saveFile', {
      handler: async (event: Electron.IpcMainInvokeEvent, options?: any) => {
        const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow()!, {
          title: options?.title || '保存文件',
          filters: options?.filters,
          defaultPath: options?.defaultPath
        })
        return result.canceled ? null : result.filePath
      },
      type: 'handle'
    })

    // 通知
    this.addChannel('notification:show', {
      handler: (event: Electron.IpcMainInvokeEvent, options: any) => {
        new Notification({
          title: options.title,
          body: options.body,
          icon: options.icon
        }).show()
      },
      type: 'handle'
    })

    // 剪贴板
    this.addChannel('clipboard:readText', {
      handler: (event: Electron.IpcMainEvent) => {
        event.returnValue = clipboard.readText()
      },
      type: 'on'
    })

    this.addChannel('clipboard:writeText', {
      handler: (event: Electron.IpcMainInvokeEvent, text: string) => {
        clipboard.writeText(text)
      },
      type: 'handle'
    })

    // 文件读取
    this.addChannel('file:read', {
      handler: async (event: Electron.IpcMainInvokeEvent, filePath: string) => {
        try {
          const fs = require('fs')
          const buffer = fs.readFileSync(filePath)
          return {
            buffer: buffer.toString('base64'),
            fileName: filePath.split(/[/\\]/).pop() || 'unknown'
          }
        } catch (error) {
          throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },
      type: 'handle'
    })

    // FFmpeg处理
    // 转码（完整能力）
    this.addChannel('ffmpeg:run', {
      handler: async (event: Electron.IpcMainInvokeEvent, params: any) => {
        return await ffmpegManager.run(params, ({
          taskId,
          progress
        }: {
          taskId: string
          progress: FFmpegProgress
        }) => {
          event.sender.send("ffmpeg:progress", {
            taskId,
            progress
          })
        })
      },
      type: 'handle'
    })

    // 截图（快速模式）
    this.addChannel('ffmpeg:screenshot', {
      handler: async (event: Electron.IpcMainInvokeEvent, input: string, time: string, output: string) => {
        return await ffmpegManager.screenshot(input, time, output)
      },
      type: 'handle'
    })

    // 精确截图
    this.addChannel('ffmpeg:screenshotAccurate', {
      handler: async (event: Electron.IpcMainInvokeEvent, input: string, time: string, output: string) => {
        return await ffmpegManager.screenshotAccurate(input, time, output)
      },
      type: 'handle'
    })

    // 裁剪视频
    this.addChannel('ffmpeg:cut', {
      handler: async (event: Electron.IpcMainInvokeEvent, input: string, output: string, start: string, duration: string, precise?: boolean) => {
        return await ffmpegManager.cut(input, output, start, duration, precise)
      },
      type: 'handle'
    })

    // 添加视频水印
    this.addChannel('ffmpeg:addWatermark', {
      handler: async (event: Electron.IpcMainInvokeEvent, input: string, output: string, watermarkImage: string, x?: number, y?: number, startTime?: string, endTime?: string, size?: number) => {

        return await ffmpegManager.addWatermark(input, output, watermarkImage, x, y, startTime, endTime, size, ({
          taskId,
          progress
        }: {
          taskId: string
          progress: FFmpegProgress
        }) => {
          event.sender.send("ffmpeg:progress", {
            taskId,
            progress
          })
        })
      },
      type: 'handle'
    })

    // 获取媒体信息
    this.addChannel('ffmpeg:getMediaInfo', {
      handler: async (event: Electron.IpcMainInvokeEvent, input: string): Promise<MediaInfo> => {
        return await ffmpegManager.getMediaInfo(input)
      },
      type: 'handle'
    })

    // ========== 路径相关 ==========

    // 获取默认输出文件路径
    this.addChannel('paths:getDefaultOutputPath', {
      handler: async (event: Electron.IpcMainInvokeEvent, prefix?: string, extension?: string) => {
        return getDefaultOutputPath(prefix || 'output', extension || 'mp4')
      },
      type: 'handle'
    })

    // 获取默认输出目录
    this.addChannel('paths:getDefaultOutputDir', {
      handler: async (event: Electron.IpcMainInvokeEvent) => {
        const paths = getAppPaths()
        console.log('[IPC] getDefaultOutputDir called, returning:', paths.defaultOutputDir)
        return paths.defaultOutputDir
      },
      type: 'handle'
    })

    // 获取所有应用路径
    this.addChannel('paths:getAppPaths', {
      handler: async (event: Electron.IpcMainInvokeEvent) => {
        const paths = getAppPaths()
        // 返回可序列化的路径对象
        return {
          appPath: paths.appPath,
          userDataPath: paths.userDataPath,
          appDataPath: paths.appDataPath,
          tempPath: paths.tempPath,
          ffmpegResourceDir: paths.ffmpegResourceDir,
          ffmpegPath: paths.ffmpegPath,
          defaultOutputDir: paths.defaultOutputDir,
          cacheDir: paths.cacheDir,
          logDir: paths.logDir,
          uploadsDir: paths.uploadsDir,
          watermarksDir: paths.watermarksDir,
          exportsDir: paths.exportsDir,
          documentsPath: paths.documentsPath,
          downloadsPath: paths.downloadsPath,
          desktopPath: paths.desktopPath,
          homePath: paths.homePath
        }
      },
      type: 'handle'
    })

  }

  /**
   * 添加 IPC 通道
   */
  private addChannel(channel: string, config: IPCChannelConfig) {
    this.channels.set(channel, config)
  }

  /**
   * 注册所有 IPC 通道
   */
  public registerAllChannels() {
    for (const [channel, config] of this.channels) {
      switch (config.type) {
        case 'handle':
          ipcMain.handle(channel, config.handler as IPCHandler)
          break
        case 'on':
          ipcMain.on(channel, config.handler as IPCOnHandler)
          break
        case 'once':
          ipcMain.once(channel, config.handler as IPCOnHandler)
          break
      }
    }

    // 注册广播处理器
    registerBroadcastHandlers()
  }

  /**
   * 获取所有通道名称（用于类型定义）
   */
  public getAllChannelNames(): string[] {
    return Array.from(this.channels.keys()).concat(Object.keys(BROADCAST_CHANNELS))
  }
}

// 导出单例实例
export const ipcHandlerManager = IPCHandlerManager.getInstance()