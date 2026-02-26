import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RouteConfig, getNavigationItems } from '../router'
import { useUserStore } from '../stores/userStore'
import { UserState } from '../types/stores'
import { useTranslation } from '../hooks/useTranslation'

interface AppTopProps {
  routes?: RouteConfig[]
}

const AppTop: React.FC<AppTopProps> = ({ routes = [] }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const userStore = useUserStore()
  const { t } = useTranslation()
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState<string>('')

  // 检查是否在新窗口中（通过URL hash参数或window.opener）
  const isInNewWindow = window.location.hash.includes('newwindow=true') || !!window.opener

  // 使用getNavigationItems生成导航项，包含新窗口打开信息
  const navItems = getNavigationItems(routes)

  useEffect(() => {
    // 获取平台信息
    if (window.electronAPI) {
      setPlatform(window.electronAPI.platform)
    }

    // 监听窗口最大化状态变化
    const handleMaximized = () => setIsMaximized(true)
    const handleUnmaximized = () => setIsMaximized(false)

    if (window.electronAPI) {
      window.electronAPI.on('window:maximized', handleMaximized)
      window.electronAPI.on('window:unmaximized', handleUnmaximized)
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.off('window:maximized', handleMaximized)
        window.electronAPI.off('window:unmaximized', handleUnmaximized)
      }
    }
  }, [])

  const handleMinimize = () => {
    if (window.electronAPI) {
      try {
        window.electronAPI.minimizeWindow()
      } catch (error) {
        console.error('Failed to minimize window:', error)
      }
    } else {
      console.error('electronAPI not available')
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI) {
      try {
        window.electronAPI.toggleMaximize()
      } catch (error) {
        console.error('Failed to toggle maximize:', error)
      }
    } else {
      console.error('electronAPI not available')
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      try {
        window.electronAPI.closeWindow()
      } catch (error) {
        console.error('Failed to close window:', error)
      }
    } else {
      console.error('electronAPI not available')
    }
  }

  const handleOpenInWindow = async (path: string, title: string) => {
    try {
      console.log('Opening window:', { path, title })
      if (window.electronAPI?.openWindow) {
        const result = await window.electronAPI.openWindow(path, title)
        console.log('Window open result:', result)
      } else {
        console.error('electronAPI.openWindow not available')
      }
    } catch (error) {
      console.error('Failed to open window:', error)
    }
  }

  const handleOpenLoginWindow = async () => {
    try {
      console.log('Opening login window')
      if (window.electronAPI?.openWindow) {
        const result = await window.electronAPI.openWindow('/login', '用户登录')
        console.log('Login window open result:', result)
      } else {
        console.error('electronAPI.openWindow not available')
      }
    } catch (error) {
      console.error('Failed to open login window:', error)
    }
  }

  const handleDoubleClick = () => {
    if (platform === 'win32') {
      handleMaximize()
    }
  }

  const handleLogout = async () => {
    try {
      await userStore.logoutAsync()
      console.log('👋 用户已登出')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 根据平台决定是否显示窗口控制按钮
  const showWindowControls = platform === 'win32'

  return (
    <div
      className="app-top h-12 text-white flex items-center justify-between px-4 relative select-none cursor-default bg-[var(--gradient-primary)]"
      onDoubleClick={handleDoubleClick}
    >
      {/* 左侧：品牌和导航 */}
      <div className="flex items-center gap-6">
        {/* 品牌信息 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center text-base">
            ⚛️
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">
              Vite + React + Electron
            </div>
            <div className="text-xs opacity-80 leading-none">
              {t('pages.home.description')}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：用户信息、状态指示器和窗口控制 */}
      <div className="flex items-center gap-4">
        {/* 用户信息（登录后显示，仅在主窗口中） */}
        {!isInNewWindow && (
          <>
            {userStore.isLoggedIn ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl">
                <span className="text-sm">
                  {userStore.currentUser?.avatar} {userStore.currentUser?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-0.5 bg-white/20 border-none rounded text-xs text-white cursor-pointer transition-colors hover:bg-white/30"
                  title="登出"
                >
                  登出
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenLoginWindow}
                className="px-3 py-1 bg-white/10 border-none rounded-xl text-sm text-white cursor-pointer transition-colors hover:bg-white/20"
                title="在新窗口中登录"
              >
                登录
              </button>
            )}
          </>
        )}

        {/* 开发环境指示器 */}
        {window.electronAPI?.appInfo.isDev && (
          <div className="px-2 py-1 bg-white/10 rounded-xl text-xs font-medium">
            DEV
          </div>
        )}

        {/* 平台信息 */}
        <div className="px-2 py-1 bg-white/10 rounded-xl text-xs font-medium">
          {platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : platform === 'linux' ? 'Linux' : platform}
        </div>

        {/* 窗口控制按钮（仅 Windows） */}
        {showWindowControls && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleMinimize}
              className="w-8 h-6 bg-transparent border-none text-[var(--text-primary)] cursor-pointer flex items-center justify-center rounded-sm text-xs transition-colors hover:bg-[var(--bg-hover)]"
              title="最小化"
            >
              ─
            </button>
            <button
              onClick={handleMaximize}
              className="w-8 h-6 bg-transparent border-none text-[var(--text-primary)] cursor-pointer flex items-center justify-center rounded-sm text-xs transition-colors hover:bg-[var(--bg-hover)]"
              title={isMaximized ? '还原' : '最大化'}
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-6 bg-transparent border-none text-red-500 cursor-pointer flex items-center justify-center rounded-sm text-xs transition-colors hover:bg-red-500 hover:text-white"
              title="关闭"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 拖拽区域指示器（仅在 Windows 开发模式显示） */}
      {platform === 'win32' && window.electronAPI?.appInfo.isDev && (
        <div className="absolute inset-0 pointer-events-none bg-green-500/5 border border-dashed border-green-500/30 flex items-center justify-center text-xs text-green-500/70 font-medium">
          可拖拽区域 (双击最大化)
        </div>
      )}
    </div>
  )
}

export default AppTop
