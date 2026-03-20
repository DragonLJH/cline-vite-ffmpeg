import React, { useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

interface ResultDisplayProps {
  originalFile: File | null
  processedFile: File | null
  onDownload: () => void
  onReprocess: () => void
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalFile,
  processedFile,
  onDownload,
  onReprocess
}) => {
  const { t } = useTranslation()
  
  // 使用useMemo缓存URL.createObjectURL的结果，避免频繁重新创建
  const originalVideoUrl = useMemo(() => {
    if (originalFile) {
      return URL.createObjectURL(originalFile)
    }
    return null
  }, [originalFile])
  
  const processedVideoUrl = useMemo(() => {
    if (processedFile) {
      return URL.createObjectURL(processedFile)
    }
    return null
  }, [processedFile])
  
  // 清理URL.createObjectURL创建的URL，避免内存泄漏
  React.useEffect(() => {
    return () => {
      if (originalVideoUrl) {
        URL.revokeObjectURL(originalVideoUrl)
      }
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl)
      }
    }
  }, [originalVideoUrl, processedVideoUrl])

  if (!processedFile) {
    return null
  }

  return (
    <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
      <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
        ✅ {t('pages_watermark_result_title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            📼 {t('pages_watermark_result_original')}
          </h3>
          <video
            src={originalVideoUrl || ''}
            controls
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            🎬 {t('pages_watermark_result_processed')}
          </h3>
          <video
            src={processedVideoUrl || ''}
            controls
            className="w-full rounded-lg"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <button 
          onClick={onDownload}
          className="inline-flex items-center px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--btn-primary-hover)]"
        >
          📥 {t('pages_watermark_result_downloadButton')}
        </button>
        <button 
          onClick={onReprocess}
          className="inline-flex items-center px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]"
        >
          🔄 {t('pages_watermark_result_reprocessButton')}
        </button>
      </div>
    </div>
  )
}

export default ResultDisplay