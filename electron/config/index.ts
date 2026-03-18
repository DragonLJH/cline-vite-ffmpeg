import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

/**
 * 确保目录存在，不存在则创建
 */
function ensureDir(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  return dirPath
}

/**
 * Electron 应用配置
 */
export const appConfig = {
  // 窗口配置
  windows: {
    main: {
      width: 1200,
      height: 800,
      title: 'Cline Vite App'
    },
    default: {
      width: 1000,
      height: 700
    }
  },

  // 开发模式配置
  development: {
    vitePort: 5173,
    openDevTools: true
  },

  // 广播配置（已移至 broadcastManager.ts）
  // IPC 配置（已移至 ipcManager.ts）

  // 应用信息
  app: {
    name: 'Cline Vite App',
    version: '1.0.0'
  },

  // 平台特定配置
  platform: {
    win32: {
      frame: false,
      titleBarStyle: 'hidden' as const,
      titleBarOverlay: false
    },
    darwin: {
      titleBarStyle: 'hiddenInset' as const
    },
    linux: {
      frame: true
    }
  }
}

/**
 * 静态路径配置（不需要 app.ready）
 */
export const staticPaths = {
  /** FFmpeg 在资源中的相对路径模板 */
  ffmpegResourceTemplate: 'public/ffmpeg/{platform}/ffmpeg',
  /** 默认输出子目录名 */
  defaultOutputSubdir: 'output',
  /** 缓存子目录名 */
  cacheSubdir: 'cache',
  /** 日志子目录名 */
  logSubdir: 'logs',
  /** 上传子目录名 */
  uploadSubdir: 'uploads',
  /** 水印图片子目录名 */
  watermarkSubdir: 'watermarks',
}

/**
 * 获取应用路径配置
 * 注意：需要在 app.whenReady() 之后调用
 */
export function getAppPaths() {
  const appPath = app.getAppPath()
  const platform = process.platform
  
  return {
    // ========== 应用基础路径 ==========
    /** 应用安装目录 */
    appPath,
    /** 用户数据目录 (Windows: %APPDATA%/cline-vite, macOS: ~/Library/Application Support/cline-vite) */
    userDataPath: app.getPath('userData'),
    /** 应用数据目录 */
    appDataPath: app.getPath('appData'),
    /** 临时目录 */
    tempPath: app.getPath('temp'),
    
    // ========== FFmpeg 相关路径 ==========
    /** FFmpeg 资源目录（打包前的源目录） */
    ffmpegResourceDir: path.join(appPath, 'public', 'ffmpeg', platform === 'win32' ? 'win' : 'mac'),
    /** FFmpeg 可执行文件完整路径 */
    ffmpegPath: path.join(
      appPath, 
      'public', 
      'ffmpeg', 
      platform === 'win32' ? 'win' : 'mac',
      platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
    ),
    
    // ========== 用户内容路径（自动创建） ==========
    /** 默认输出目录 */
    defaultOutputDir: ensureDir(path.join(app.getPath('userData'), 'output')),
    /** 视频文件缓存目录 */
    cacheDir: ensureDir(path.join(app.getPath('userData'), 'cache')),
    /** 日志目录 */
    logDir: ensureDir(path.join(app.getPath('userData'), 'logs')),
    /** 用户上传文件目录 */
    uploadsDir: ensureDir(path.join(app.getPath('userData'), 'uploads')),
    /** 水印图片目录 */
    watermarksDir: ensureDir(path.join(app.getPath('userData'), 'watermarks')),
    /** 导出目录（用于导出项目、批量处理等） */
    exportsDir: ensureDir(path.join(app.getPath('userData'), 'exports')),
    
    // ========== 系统路径 ==========
    /** 文档目录 */
    documentsPath: app.getPath('documents'),
    /** 下载目录 */
    downloadsPath: app.getPath('downloads'),
    /** 桌面目录 */
    desktopPath: app.getPath('desktop'),
    /** 用户主目录 */
    homePath: app.getPath('home'),
  }
}

/**
 * 生成带时间戳的输出文件名
 * @param prefix 文件名前缀
 * @param extension 文件扩展名（不带点）
 */
export function generateOutputFilename(prefix: string = 'output', extension: string = 'mp4'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${prefix}_${timestamp}.${extension}`
}

/**
 * 获取默认输出文件完整路径
 * @param prefix 文件名前缀
 * @param extension 文件扩展名
 */
export function getDefaultOutputPath(prefix: string = 'output', extension: string = 'mp4'): string {
  // 需要在 app.ready 之后使用
  const paths = getAppPaths()
  return path.join(paths.defaultOutputDir, generateOutputFilename(prefix, extension))
}
