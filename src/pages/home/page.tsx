import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const features = [
    { icon: '⚡', name: 'Vite', desc: t('pages.home.features.vite.description') },
    { icon: '⚛️', name: 'React', desc: t('pages.home.features.react.description') },
    { icon: '🔷', name: 'TypeScript', desc: t('pages.home.features.typescript.description') },
    { icon: '🖥️', name: 'Electron', desc: t('pages.home.features.electron.description') },
    { icon: '🧭', name: 'React Router', desc: t('pages.home.features.router.description') },
    { icon: '📦', name: 'Zustand', desc: t('pages.home.features.zustand.description') }
  ]

  return (
    <div className="min-h-screen p-8 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto">
        {/* 头部区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🏠 {t('pages.home.title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t('pages.home.description')}
          </p>
        </div>

        {/* 功能特性网格 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🎯 {t('pages.home.featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-md)] border border-[var(--border-primary)] transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
                  {feature.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>



        {/* 快速导航 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h2 className="text-4xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🧭 {t('pages.home.quickNavTitle')}
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/counter"
              className="inline-flex items-center px-8 py-4 bg-[var(--btn-primary)] text-[var(--text-inverse)] no-underline rounded-xl font-semibold text-lg shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:bg-[var(--btn-primary-hover)]"
            >
              <span className="text-2xl mr-2">🔢</span>
              {t('navigation.counter')}
            </a>
            <a
              href="/about"
              className="inline-flex items-center px-8 py-4 bg-[var(--btn-primary)] text-[var(--text-inverse)] no-underline rounded-xl font-semibold text-lg shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:bg-[var(--btn-primary-hover)]"
            >
              <span className="text-2xl mr-2">ℹ️</span>
              {t('navigation.about')}
            </a>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-12">
          <p className="text-[var(--text-muted)]">
            {t('pages.home.exploreText')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
