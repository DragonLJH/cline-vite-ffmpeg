import React from 'react'

const AboutPage: React.FC = () => {
  const techStack = [
    {
      title: '前端框架',
      items: ['⚛️ React 19', '🔷 TypeScript', '🧭 React Router v6']
    },
    {
      title: '构建工具',
      items: ['⚡ Vite', '📦 Electron Builder']
    },
    {
      title: '状态管理',
      items: ['📦 Zustand', '🔄 React Hooks']
    },
    {
      title: '样式系统',
      items: ['🎨 Tailwind CSS', '🛠️ SCSS', '📱 响应式设计']
    }
  ]

  const features = [
    '🚀 快速的热重载开发体验',
    '📱 响应式设计，支持多种屏幕尺寸',
    '🔒 类型安全的 TypeScript 支持',
    '🗂️ 模块化的项目结构',
    '🎨 现代化的 UI 设计',
    '⚡ 优化的构建和打包流程'
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            ℹ️ 关于我们
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            这是一个使用现代技术栈构建的桌面应用程序
          </p>
        </div>

        {/* 技术栈 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🛠️ 技术栈
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((category, index) => (
              <div
                key={index}
                className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-md)] border border-[var(--border-primary)]"
              >
                <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-[var(--text-secondary)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 主要特性 */}
        <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border-l-4 border-[var(--btn-primary)] mb-12">
          <h2 className="text-4xl font-bold mb-8 text-[var(--text-primary)]">
            ✨ 主要特性
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-[var(--bg-card)] rounded-lg shadow-[var(--shadow-sm)] border border-[var(--border-primary)] text-[var(--text-primary)]"
              >
                <span className="mr-3">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 系统信息和 API 演示 */}
        <div className="mt-12 text-center p-8 bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h3 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
            🔧 系统信息和 API 演示
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.platform || '未知'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                操作系统
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.version || '未知'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Electron 版本
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.appInfo.isDev ? '开发环境' : '生产环境'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                运行模式
              </div>
            </div>
          </div>

          {/* API 功能演示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => window.electronAPI?.showNotification({
                title: '测试通知',
                body: '这是一个来自 Electron 的通知！'
              })}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📢 显示通知
            </button>
            <button
              onClick={async () => {
                const result = await window.electronAPI?.openFileDialog({
                  title: '选择一个文件',
                  filters: [{ name: '所有文件', extensions: ['*'] }]
                })
                if (result && result.length > 0) {
                  alert(`选择了文件: ${result[0]}`)
                }
              }}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📁 打开文件
            </button>
            <button
              onClick={() => {
                const text = window.electronAPI?.clipboard.readText() || '剪贴板为空'
                alert(`剪贴板内容: ${text}`)
              }}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📋 读取剪贴板
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-sm">
            通过 Preload API 安全地访问系统功能，无需 nodeIntegration
          </p>
        </div>

        {/* 项目信息 */}
        <div className="mt-12 text-center p-8 bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h3 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
            📂 项目信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                v1.0.0
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                版本
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                React + TS
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                技术栈
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                Electron
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                运行环境
              </div>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            一个现代化的桌面应用程序示例项目
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
