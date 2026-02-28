import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import AppTop from '@/components/AppTop'
import { getRoutesWithMeta, RouteConfig, getNavigationItems } from '@/router'
import { useTranslation } from '@/hooks/useTranslation'
// import { useUserStore } from '@/stores/userStore'
// 导入主题系统，确保在应用启动时初始化
import './stores/themeStore'
import './App.scss'

// 加载组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48 text-lg text-gray-500">
    <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
)

// 路由组件包装器
const RouteWrapper: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const Component = route.component
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  )
}

// 导航侧边栏组件
const Sidebar: React.FC<{ routes: RouteConfig[] }> = ({ routes }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const initial = useMemo(() => location.pathname !== '/', [])

  const navItems = useMemo<any[]>(() => {
    if (routes) {
      const res = getNavigationItems(routes)
      console.log('[navItems]', res)
      return res
    }
    return []
  }, [routes, t])

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

  if (initial) return <></>

  return (
    <aside className="w-70 flex flex-col py-4 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]">
      {/* 侧边栏头部 */}
      <div className="px-4 py-4 mb-4 border-b border-[var(--border-primary)]">
        <h2 className="m-0 text-xl font-semibold text-center text-[var(--text-primary)]">
          {t('components_sidebar_title')}
        </h2>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <div key={item.path} className="mb-2 flex items-center gap-2">
            <Link
              to={item.path}
              className={`flex-1 p-3 block no-underline rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === item.path
                ? 'bg-[var(--gradient-primary)] text-[var(--text-inverse)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5'
                }`}
            >
              {t(item.label)}
            </Link>
            {item.canOpenWindow && (
              <button
                onClick={() => handleOpenInWindow(item.path, item.label.replace(/^[^\s]+\s/, ''))}
                className="p-2 rounded-md cursor-pointer text-xs opacity-70 transition-all duration-200 w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:opacity-100 hover:bg-[var(--gradient-primary)] hover:text-[var(--text-inverse)]"
                title={t('navigation_openInWindow')}
              >
                🪟
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

// 应用根组件
function App() {
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [routesLoading, setRoutesLoading] = useState(true)

  useEffect(() => {
    // 异步获取包含元数据的路由配置
    getRoutesWithMeta().then((routesWithMeta) => {
      setRoutes(routesWithMeta)
      setRoutesLoading(false)
      console.log('🎯 路由元数据加载完成:', routesWithMeta.length, '个页面')
    }).catch((error) => {
      console.error('❌ 路由配置加载失败:', error)
      setRoutesLoading(false)
    })

    // 监听登录成功事件（仅在主窗口中）
    if (window.electronAPI?.onLoginSuccess) {
      const handleLoginSuccess = (userData: any) => {
        console.log('📥 收到登录成功事件:', userData)

        // 导入用户store并更新状态
        import('./stores/userStore').then(({ useUserStore }) => {
          const userStore = useUserStore.getState()
          userStore.login(userData)
          console.log('✅ 主窗口用户状态已更新:', userData.name)
        }).catch((error) => {
          console.error('❌ 更新用户状态失败:', error)
        })
      }

      window.electronAPI.onLoginSuccess(handleLoginSuccess)

      return () => {
        // 清理事件监听
        if (window.electronAPI?.off) {
          window.electronAPI.off('login:success', handleLoginSuccess)
        }
      }
    }
  }, [])

  if (routesLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          正在加载应用...
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app h-screen flex m-0 p-0 overflow-hidden">
        {/* 顶部标题栏 */}
        <AppTop routes={routes} />

        {/* 主体内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧导航侧边栏（仅在主窗口中显示） */}
          <Sidebar routes={routes} />

          {/* 主要内容 */}
          <main className="main-content flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-primary)]">
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<RouteWrapper route={route} />}
                />
              ))}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
