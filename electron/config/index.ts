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