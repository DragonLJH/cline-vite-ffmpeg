import React, { useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

interface ResultDisplayProps {
  originalFile: File | null
  processedFile: File | null
  processedFilePath?: string | null
  onDownload: () => void
  onReprocess: () => void
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalFile,
  processedFile,
  processedFilePath,
  onDownload,
  onReprocess
}) => {
  const { t } = useTranslation()
  
  // 使用useMemo缓存视频URL，避免频繁重新创建
  const originalVideoUrl = useMemo(() => {
    if (originalFile) {
      // 在Electron中，File对象有path属性指向本地文件
      const filePath = (originalFile as any).path
      if (filePath) {
        // 使用自定义的local-file://协议处理本地文件
        const normalizedPath = filePath.replace(/\\/g, '/')
        // 确保路径以/开头
        const pathWithPrefix = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
        return `local-file://${pathWithPrefix}`
      }
      // 如果没有path属性，使用Object URL
      return URL.createObjectURL(originalFile)
    }
    return null
  }, [originalFile])
  
  const processedVideoUrl = useMemo(() => {
    // 如果有文件路径，使用自定义的local-file://协议
    if (processedFilePath) {
      // 将Windows路径转换为local-file:// URL
      // 路径需要以 / 开头，如 local-file:///C:/Users/...
      const normalizedPath = processedFilePath.replace(/\\/g, '/')
      // 确保路径以/开头
      const pathWithPrefix = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
      return `local-file://${pathWithPrefix}`
    }
    // 如果没有文件路径但有File对象，使用Object URL
    if (processedFile) {
      const filePath = (processedFile as any).path
      if (filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/')
        const pathWithPrefix = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
        return `local-file://${pathWithPrefix}`
      }
      return URL.createObjectURL(processedFile)
    }
    return null
  }, [processedFile, processedFilePath])
  
  // 清理URL.createObjectURL创建的URL，避免内存泄漏
  React.useEffect(() => {
    return () => {
      if (originalVideoUrl) {
        URL.revokeObjectURL(originalVideoUrl)
      }
      // 只有当URL是Object URL时才需要清理
      if (processedVideoUrl && processedVideoUrl.startsWith('blob:')) {
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