import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const AboutPage: React.FC = () => {
  const { t } = useTranslation()
  const techStack = [
    {
      title: t('pages_about_techCategories_frontend'),
      items: [t('pages_about_techItems_react'), t('pages_about_techItems_typescript'), t('pages_about_techItems_router')]
    },
    {
      title: t('pages_about_techCategories_build'),
      items: [t('pages_about_techItems_vite'), t('pages_about_techItems_electronBuilder')]
    },
    {
      title: t('pages_about_techCategories_state'),
      items: [t('pages_about_techItems_zustand'), t('pages_about_techItems_hooks')]
    },
    {
      title: t('pages_about_techCategories_styling'),
      items: [t('pages_about_techItems_tailwind'), t('pages_about_techItems_scss'), t('pages_about_techItems_responsive')]
    }
  ]

  const features = [
    t('pages_about_features_1'),
    t('pages_about_features_2'),
    t('pages_about_features_3'),
    t('pages_about_features_4'),
    t('pages_about_features_5'),
    t('pages_about_features_6')
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            ℹ️ {t('pages.about.title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t('pages.about.description')}
          </p>
        </div>

        {/* 技术栈 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🛠️ {t('pages.about.techStackTitle')}
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
            ✨ {t('pages.about.featuresTitle')}
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
            🔧 {t('pages.about.systemInfoTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.platform || t('pages.about.systemInfo.unknown')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.systemInfo.os')}
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.version || t('pages.about.systemInfo.unknown')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.systemInfo.electronVersion')}
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {window.electronAPI?.appInfo.isDev ? t('pages.about.systemInfo.dev') : t('pages.about.systemInfo.production')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.systemInfo.mode')}
              </div>
            </div>
          </div>

          {/* API 功能演示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => window.electronAPI?.showNotification({
                title: t('api.notification.title'),
                body: t('api.notification.body')
              })}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📢 {t('pages.about.apiDemo.notification')}
            </button>
            <button
              onClick={async () => {
                const result = await window.electronAPI?.openFileDialog({
                  title: t('pages.about.apiDemo.fileDialogTitle'),
                  filters: [{ name: '所有文件', extensions: ['*'] }]
                })
                if (result && result.length > 0) {
                  alert(`选择了文件: ${result[0]}`)
                }
              }}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📁 {t('pages.about.apiDemo.fileDialog')}
            </button>
            <button
              onClick={() => {
                const text = window.electronAPI?.clipboard.readText() || t('pages.about.apiDemo.clipboardEmpty')
                alert(`${t('pages.about.apiDemo.clipboardContent').replace('{text}', text)}`)
              }}
              className="px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] hover:-translate-y-1"
            >
              📋 {t('pages.about.apiDemo.clipboard')}
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-sm">
            {t('pages.about.systemInfo.description')}
          </p>
        </div>

        {/* 项目信息 */}
        <div className="mt-12 text-center p-8 bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h3 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
            📂 {t('pages.about.projectInfoTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {t('pages.about.projectInfo.versionValue')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.projectInfo.version')}
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {t('pages.about.projectInfo.techStackValue')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.projectInfo.techStack')}
              </div>
            </div>
            <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              <div className="text-2xl font-bold text-[var(--btn-primary)]">
                {t('pages.about.projectInfo.runtimeValue')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {t('pages.about.projectInfo.runtime')}
              </div>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            {t('pages.about.projectInfo.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
