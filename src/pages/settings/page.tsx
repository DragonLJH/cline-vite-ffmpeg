import React from 'react'
import { useThemeStore, type ThemeType } from '../../stores/themeStore'

const SettingsPage: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  const themeOptions: { value: ThemeType; label: string; icon: string; description: string }[] = [
    {
      value: 'light',
      label: '浅色主题',
      icon: '☀️',
      description: '明亮、清爽的视觉体验'
    },
    {
      value: 'dark',
      label: '深色主题',
      icon: '🌙',
      description: '护眼的深色界面设计'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            ⚙️ 设置
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            个性化您的应用体验
          </p>
        </div>

        {/* 设置卡片容器 */}
        <div className="space-y-8">

          {/* 主题设置卡片 */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[var(--shadow-md)] transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="text-4xl mr-4">
                🎨
              </div>
              <div>
                <h2 className="text-3xl font-semibold mb-2 text-[var(--text-primary)]">
                  主题设置
                </h2>
                <p className="text-[var(--text-secondary)]">
                  选择您喜欢的视觉主题
                </p>
              </div>
            </div>

            {/* 主题选项 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex relative items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    theme === option.value 
                      ? 'border-[var(--border-focus)] bg-[var(--bg-hover)]' 
                      : 'border-[var(--border-primary)] bg-[var(--bg-card)] hover:border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={theme === option.value}
                    onChange={(e) => setTheme(e.target.value as ThemeType)}
                    className="absolute opacity-0 pointer-events-none"
                  />

                  {/* 选中指示器 */}
                  {theme === option.value && (
                    <div className="absolute top-4 right-4 w-5 h-5 bg-[var(--btn-primary)] rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}

                  {/* 主题图标和信息 */}
                  <div className={`text-4xl mr-4 ${theme === option.value ? 'opacity-100' : 'opacity-70'}`}>
                    {option.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
                      {option.label}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* 快速切换按钮 */}
            <div className="mt-8 pt-8 border-t border-[var(--border-primary)]">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center px-6 py-3 bg-[var(--btn-primary)] text-white border-none rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <span className="mr-2">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                快速切换到{theme === 'light' ? '深色' : '浅色'}主题
              </button>
            </div>
          </div>

          {/* 其他设置卡片占位符 */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[var(--shadow-md)] opacity-60">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">
                🔄
              </div>
              <div>
                <h2 className="text-3xl font-semibold mb-2 text-[var(--text-primary)]">
                  更多设置
                </h2>
                <p className="text-[var(--text-secondary)]">
                  敬请期待更多个性化选项
                </p>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-sm">
              未来版本将添加更多设置选项，包括语言、通知、数据管理等功能。
            </p>
          </div>

        </div>

        {/* 底部信息 */}
        <div className="text-center mt-12 p-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
          <p className="text-[var(--text-secondary)]">
            设置会自动保存到本地存储，重启应用后仍然生效。
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
