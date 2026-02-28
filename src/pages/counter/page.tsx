import React from 'react'
import { useCounterStore } from '../../stores/counterStore'
import { useTranslation } from '../../hooks/useTranslation'

const CounterPage: React.FC = () => {
  const { count, increment, decrement, reset, incrementBy, decrementBy } = useCounterStore()
  const { t } = useTranslation()

  const getStatusColor = () => {
    if (count > 0) return 'bg-[var(--bg-tertiary)] text-[var(--btn-primary)]'
    if (count < 0) return 'bg-[var(--bg-tertiary)] text-red-600'
    return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
  }

  const getStatusText = () => {
    if (count > 0) return '正数'
    if (count < 0) return '负数'
    return '零'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🔢 {t('pages_counter_title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            {t('pages_counter_description')}
          </p>
        </div>

        {/* 计数器显示 */}
        <div className="bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 p-12 rounded-3xl text-center text-white mb-8 shadow-2xl">
          <div className="text-9xl font-extrabold mb-4 drop-shadow-2xl">
            {count}
          </div>
          <p className="text-2xl opacity-90 mb-6">{t('pages_counter_currentCount')}</p>
          <div className={`inline-block mt-4 px-6 py-3 ${getStatusColor()} rounded-full text-sm font-semibold transition-all duration-300`}>
            {getStatusText()}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)] mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">
            🎮 {t('pages_counter_controlsTitle')}
          </h2>

          {/* 基本操作 */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={decrement}
              className="px-8 py-4 bg-red-600 text-white border-none rounded-xl font-bold text-lg cursor-pointer transition-all duration-200 hover:bg-red-700 hover:-translate-y-2 hover:shadow-xl"
            >
              ➖ {t('pages_counter_decrement')}
            </button>
            <button
              onClick={reset}
              className="px-8 py-4 bg-amber-500 text-white border-none rounded-xl font-bold text-lg cursor-pointer transition-all duration-200 hover:bg-amber-600 hover:-translate-y-2 hover:shadow-xl"
            >
              🔄 {t('pages_counter_reset')}
            </button>
            <button
              onClick={increment}
              className="px-8 py-4 bg-blue-600 text-white border-none rounded-xl font-bold text-lg cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:-translate-y-2 hover:shadow-xl"
            >
              ➕ {t('pages_counter_increment')}
            </button>
          </div>

          {/* 批量操作 */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">
              {t('pages_counter_batchOperations')}
            </h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {[5, 10].map(num => (
                <React.Fragment key={num}>
                  <button
                    onClick={() => incrementBy(num)}
                    className="px-6 py-3 bg-emerald-600 text-white border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-1"
                  >
                    +{num}
                  </button>
                  <button
                    onClick={() => decrementBy(num)}
                    className="px-6 py-3 bg-red-600 text-white border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 hover:bg-red-700 hover:-translate-y-1"
                  >
                    -{num}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">
            📊 {t('pages_counter_statusTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className="text-4xl font-bold mb-2 text-[var(--text-primary)]">
                {count}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{t('pages_counter_currentValue')}</div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className={`text-4xl font-bold mb-2 ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{t('pages_counter_status')}</div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <div className={`text-4xl font-bold mb-2 ${count >= -10 && count <= 10 ? 'text-[var(--btn-primary)]' : 'text-red-600'}`}>
                {count >= -10 && count <= 10 ? '✓' : '⚠️'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{t('pages_counter_rangeStatus')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CounterPage
