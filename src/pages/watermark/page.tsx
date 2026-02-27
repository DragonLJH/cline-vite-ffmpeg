import React, { useState, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useWatermarkStore } from '@/stores/watermarkStore'
import Upload from '../../components/common/Upload'

// 页面元数据
export const pageMeta = {
  title: 'pages.watermark.title',
  description: 'pages.watermark.description',
  path: '/watermark',
  icon: '🎬',
  permissions: [],
  showInMenu: true,
  canOpenWindow: true
}

const WatermarkPage: React.FC = () => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    selectedFile,
    processedFile,
    isProcessing,
    progress,
    addWatermark,
    resetState
  } = useWatermarkStore()

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      // 这里应该调用 Electron API 来处理视频文件
      console.log('Selected video file:', file.name)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen p-8 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        {/* 头部区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🎬 {t('pages.watermark.title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            {t('pages.watermark.description')}
          </p>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左侧：文件上传区域 */}
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
              📁 {t('pages.watermark.upload.title')}
            </h2>

            {/* 使用公共上传组件 */}
            <Upload
              accept="video/*"
              maxSize={100}
              multiple={false}
              uploadText={t('pages.watermark.upload.dropTitle')}
              buttonText={t('pages.watermark.upload.selectButton')}
              showFileList={false}
              onFileSelect={(files) => {
                if (files.length > 0) {
                  // 这里应该调用 Electron API 来处理视频文件
                  console.log('Selected video file:', files[0].name)
                }
              }}
              className="upload-video-area"
            />

            {/* 文件信息显示 */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                  📄 {t('pages.watermark.upload.selectedFile')}
                </h4>
                <p className="text-[var(--text-secondary)]">{selectedFile.name}</p>
              </div>
            )}
          </div>

          {/* 右侧：处理配置区域 */}
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
              ⚙️ {t('pages.watermark.config.title')}
            </h2>

            {/* 水印配置表单 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  💬 {t('pages.watermark.config.watermarkText')}
                </label>
                <input
                  type="text"
                  placeholder={t('pages.watermark.config.watermarkTextPlaceholder')}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  🎨 {t('pages.watermark.config.position')}
                </label>
                <select className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]">
                  <option>{t('pages.watermark.config.positions.topLeft')}</option>
                  <option>{t('pages.watermark.config.positions.topRight')}</option>
                  <option>{t('pages.watermark.config.positions.bottomLeft')}</option>
                  <option>{t('pages.watermark.config.positions.bottomRight')}</option>
                  <option>{t('pages.watermark.config.positions.center')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  🔢 {t('pages.watermark.config.opacity')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('pages.watermark.config.opacityLow')}</span>
                  <span>{t('pages.watermark.config.opacityHigh')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  📏 {t('pages.watermark.config.size')}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  defaultValue="50"
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('pages.watermark.config.sizeSmall')}</span>
                  <span>{t('pages.watermark.config.sizeLarge')}</span>
                </div>
              </div>

              {/* 处理按钮 */}
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--btn-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--text-inverse)] mr-2"></span>
                      {t('pages.watermark.config.processing')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      🎬 {t('pages.watermark.config.processButton')}
                    </span>
                  )}
                </button>
                <button
                  onClick={resetState}
                  className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]"
                >
                  🗑️ {t('pages.watermark.config.resetButton')}
                </button>
              </div>

              {/* 进度条 */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
                    <span>{t('pages.watermark.config.progress')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                    <div
                      className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 结果展示区域 */}
        {processedFile && (
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
              ✅ {t('pages.watermark.result.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  📼 {t('pages.watermark.result.original')}
                </h3>
                <video
                  src={URL.createObjectURL(selectedFile!)}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  🎬 {t('pages.watermark.result.processed')}
                </h3>
                <video
                  src={URL.createObjectURL(processedFile)}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button className="inline-flex items-center px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--btn-primary-hover)]">
                📥 {t('pages.watermark.result.downloadButton')}
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]">
                🔄 {t('pages.watermark.result.reprocessButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WatermarkPage