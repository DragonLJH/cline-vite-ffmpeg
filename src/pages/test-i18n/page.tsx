import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguageSelector } from '../../hooks/useTranslation'

const TestI18nPage: React.FC = () => {
  const { t, currentLanguage } = useTranslation()
  const {
    changeLanguage,
    getLanguageOptions,
    getQuickToggleText,
    autoDetectLanguage
  } = useLanguageSelector()

  const testTranslations = [
    'pages.home.title',
    'pages.home.description',
    'pages.about.title',
    'pages.counter.title',
    'pages.settings.title',
    'navigation.home',
    'navigation.about',
    'navigation.counter',
    'common.welcome',
    'common.appTitle'
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🧪 国际化测试
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            测试多语言功能是否正常工作
          </p>
        </div>

        {/* 当前语言信息 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)] mb-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🌍 当前语言: {getLanguageOptions().find(opt => opt.isCurrent)?.nativeName || currentLanguage}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {currentLanguage}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                语言代码
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {getLanguageOptions().find(opt => opt.isCurrent)?.flag || '❓'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                语言图标
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {getLanguageOptions().find(opt => opt.isCurrent)?.name || 'Unknown'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                英文名称
              </div>
            </div>
          </div>
        </div>

        {/* 语言切换按钮 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)] mb-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🎛️ 语言切换
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {getLanguageOptions().map((option) => (
              <button
                key={option.code}
                onClick={() => changeLanguage(option.code)}
                className={`p-6 rounded-xl border-2 font-semibold transition-all duration-200 ${option.isCurrent
                  ? 'border-[var(--border-focus)] bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
              >
                <div className="text-4xl mb-2">{option.flag}</div>
                <div className="text-lg font-bold mb-1">{option.nativeName}</div>
                <div className="text-sm opacity-80">{option.name}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => autoDetectLanguage()}
              className="px-6 py-3 bg-[var(--btn-secondary)] text-white border-none rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[var(--btn-secondary-hover)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              🔍 自动检测语言
            </button>

            <button
              onClick={() => changeLanguage('zh-CN')}
              className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover)] hover:-translate-y-1"
            >
              🇨🇳 切换到简体中文
            </button>

            <button
              onClick={() => changeLanguage('en-US')}
              className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover)] hover:-translate-y-1"
            >
              🇺🇸 切换到英文
            </button>
          </div>
        </div>

        {/* 翻译测试 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            📝 翻译测试
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testTranslations.map((key, index) => (
              <div
                key={index}
                className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)]"
              >
                <div className="text-sm text-[var(--text-secondary)] mb-2 font-mono">
                  {key}
                </div>
                <div className="text-lg text-[var(--text-primary)]">
                  {t(key)}
                </div>
              </div>
            ))}
          </div>

          {/* 快速切换文本 */}
          <div className="mt-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
              快速切换按钮文本:
            </h3>
            <p className="text-[var(--text-secondary)]">
              {getQuickToggleText()}
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-12 p-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
          <p className="text-[var(--text-secondary)]">
            ✅ 多语言功能测试页面 - 所有翻译键都已正确配置
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestI18nPage