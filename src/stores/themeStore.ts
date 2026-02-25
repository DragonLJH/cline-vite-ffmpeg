import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeType = 'light' | 'dark'

interface ThemeState {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

// 主题配置
export const themes = {
  light: {
    // 背景色
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#f1f5f9',
    '--bg-card': '#ffffff',
    '--bg-hover': '#f8fafc',

    // 文字颜色
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--text-muted': '#94a3b8',
    '--text-inverse': '#0f172a',

    // 边框颜色
    '--border-primary': '#e2e8f0',
    '--border-secondary': '#cbd5e1',
    '--border-focus': '#3b82f6',

    // 按钮颜色
    '--btn-primary': '#3b82f6',
    '--btn-primary-hover': '#2563eb',
    '--btn-secondary': '#f1f5f9',
    '--btn-secondary-hover': '#e2e8f0',

    // 阴影
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',

    // 渐变
    '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  dark: {
    // 背景色
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--bg-card': '#1e293b',
    '--bg-hover': '#334155',

    // 文字颜色
    '--text-primary': '#f8fafc',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#64748b',
    '--text-inverse': '#ffffff',

    // 边框颜色
    '--border-primary': '#334155',
    '--border-secondary': '#475569',
    '--border-focus': '#60a5fa',

    // 按钮颜色
    '--btn-primary': '#3b82f6',
    '--btn-primary-hover': '#60a5fa',
    '--btn-secondary': '#334155',
    '--btn-secondary-hover': '#475569',

    // 阴影
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.5)',

    // 渐变
    '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    '--gradient-secondary': 'linear-gradient(135deg, #334155 0%, #475569 100%)',
  }
}

// 应用主题到DOM
const applyTheme = (theme: ThemeType) => {
  const root = document.documentElement
  const themeVars = themes[theme]

  Object.entries(themeVars).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // 设置data-theme属性用于其他样式判断
  root.setAttribute('data-theme', theme)
}

// 检查是否为Electron环境
const isElectron = typeof window !== 'undefined' && window.electronAPI

// 标记是否正在接收外部主题变化，避免重复广播
let isReceivingExternalChange = false

// 广播主题更改到其他窗口
const broadcastThemeChange = (theme: ThemeType) => {
  if (isElectron && !isReceivingExternalChange) {
    // 只有当不是从广播接收到的更改时，才发送到主进程
    window.electronAPI.broadcastThemeChange(theme)
  }
}

// 监听来自其他窗口的主题更改广播
const setupThemeBroadcastListener = () => {
  if (isElectron) {
    window.electronAPI.on('theme:changed', (event: any, newTheme: ThemeType) => {
      isReceivingExternalChange = true
      // 接收到广播时，更新本地主题但不再次广播
      const currentTheme = useThemeStore.getState().theme
      if (currentTheme !== newTheme) {
        useThemeStore.setState({ theme: newTheme })
        applyTheme(newTheme)
      }
      isReceivingExternalChange = false
    })
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme: ThemeType) => {
        set({ theme })
        applyTheme(theme)
        broadcastThemeChange(theme)
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
        broadcastThemeChange(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
        // 设置监听器
        setupThemeBroadcastListener()
      }
    }
  )
)

// 初始化主题和监听器
if (typeof window !== 'undefined') {
  const theme = useThemeStore.getState().theme
  applyTheme(theme)
  setupThemeBroadcastListener()
}
