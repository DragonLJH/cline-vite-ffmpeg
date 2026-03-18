import React, { useState, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useWatermarkStore } from '@/stores/watermarkStore'
import Upload from '@/components/common/Upload'

// 页面元数据
export const pageMeta = {
  title: 'pages_watermark_title',
  description: 'pages_watermark_description',
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
    watermarkImage,
    outputPath,
    processedFile,
    isProcessing,
    progress,
    setSelectedFile,
    setWatermarkImage,
    setOutputPath,
    addWatermark,
    resetState
  } = useWatermarkStore()

  // 水印配置状态
  const [watermarkText, setWatermarkText] = useState('')
  const [position, setPosition] = useState('topLeft')
  const [opacity, setOpacity] = useState(50)
  const [size, setSize] = useState(50)


  const handleWatermarkImageSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      console.log('Selected watermark image:', file.name)
      setWatermarkImage(file)
    }
  }

  const handleSelectOutputPath = async () => {
    try {
      const result = await window.electronAPI.saveFileDialog({
        title: '选择输出路径',
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv'] }
        ],
        defaultPath: selectedFile ? `watermarked_${selectedFile.name}` : 'watermarked_video.mp4'
      })

      if (result) {
        setOutputPath(result)
      }
    } catch (error) {
      console.error('[WatermarkPage] Failed to select output path:', error)
    }
  }

  const handleProcessWatermark = async () => {
    if (!selectedFile || !watermarkImage || !outputPath) {
      console.error('[WatermarkPage] Missing required files or output path')
      return
    }

    await addWatermark({
      text: watermarkText,
      position,
      opacity,
      size
    })
  }

  return (
    <div className="min-h-screen p-8 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        {/* 头部区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🎬 {t('pages_watermark_title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            {t('pages_watermark_description')}
          </p>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左侧：文件上传区域 */}
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
              📁 {t('pages_watermark_upload_title')}
            </h2>

            {/* 使用公共上传组件 */}
            <Upload
              accept="video/*"
              maxSize={100 * 1024 * 1024} // 100MB
              multiple={false}
              uploadText={t('pages_watermark_upload_dropTitle')}
              buttonText={t('pages_watermark_upload_selectButton')}
              showFileList={false}
              onFileSelect={(files) => {
                console.log('[WatermarkPage] onFileSelect called with:', files)
                if (files.length > 0) {
                  const file = files[0]
                  console.log('[WatermarkPage] Selected file:', file.name, file.type, file.size)
                  // 使用 store 的 setSelectedFile 方法
                  useWatermarkStore.getState().setSelectedFile(file)
                  console.log('[WatermarkPage] Updated store selectedFile')
                }
              }}
              onChange={(file) => {
                console.log('[WatermarkPage] onChange called with:', file)
                if (file && !Array.isArray(file)) {
                  console.log('[WatermarkPage] Setting selectedFile in store:', file.name)
                  // 使用 store 的 setSelectedFile 方法
                  useWatermarkStore.getState().setSelectedFile(file)
                  console.log('[WatermarkPage] Store updated, selectedFile:', useWatermarkStore.getState().selectedFile?.name)
                }
              }}
              className="upload-video-area"
            />

            {/* 文件信息显示 */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                  📄 {t('pages_watermark_upload_selectedFile')}
                </h4>
                <p className="text-[var(--text-secondary)]">{selectedFile.name}</p>
              </div>
            )}
          </div>

          {/* 右侧：处理配置区域 */}
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
              ⚙️ {t('pages_watermark_config_title')}
            </h2>

            {/* 水印配置表单 */}
            <div className="space-y-6">
              {/* 水印图片上传 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  🖼️ 水印图片
                </label>
                <Upload
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  multiple={false}
                  uploadText="拖拽水印图片到此处"
                  buttonText="选择水印图片"
                  showFileList={false}
                  onFileSelect={(files) => {
                    if (files.length > 0) {
                      handleWatermarkImageSelect(files[0])
                    }
                  }}
                  onChange={(file) => {
                    if (file && !Array.isArray(file)) {
                      handleWatermarkImageSelect(file)
                    }
                  }}
                />
                {watermarkImage && (
                  <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded">
                    <p className="text-sm text-[var(--text-secondary)]">
                      已选择: {watermarkImage.name}
                    </p>
                  </div>
                )}
              </div>

              {/* 输出路径选择 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  📁 输出路径
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputPath || ''}
                    readOnly
                    placeholder="选择输出路径..."
                    className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                  />
                  <button
                    onClick={handleSelectOutputPath}
                    className="px-4 py-3 bg-[var(--btn-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-card)]"
                  >
                    浏览
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  💬 {t('pages_watermark_config_watermarkText')}
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder={t('pages_watermark_config_watermarkTextPlaceholder')}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  🎨 {t('pages_watermark_config_position')}
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
                >
                  <option value="topLeft">{t('pages_watermark_config_positions_topLeft')}</option>
                  <option value="topRight">{t('pages_watermark_config_positions_topRight')}</option>
                  <option value="bottomLeft">{t('pages_watermark_config_positions_bottomLeft')}</option>
                  <option value="bottomRight">{t('pages_watermark_config_positions_bottomRight')}</option>
                  <option value="center">{t('pages_watermark_config_positions_center')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  🔢 {t('pages_watermark_config_opacity')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('pages_watermark_config_opacityLow')}</span>
                  <span>{opacity}%</span>
                  <span>{t('pages_watermark_config_opacityHigh')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  📏 {t('pages_watermark_config_size')}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('pages_watermark_config_sizeSmall')}</span>
                  <span>{size}%</span>
                  <span>{t('pages_watermark_config_sizeLarge')}</span>
                </div>
              </div>

              {/* 处理按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={handleProcessWatermark}
                  disabled={!selectedFile || !watermarkImage || !outputPath || isProcessing}
                  className="flex-1 px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--btn-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--text-inverse)] mr-2"></span>
                      {t('pages_watermark_config_processing')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      🎬 {t('pages_watermark_config_processButton')}
                    </span>
                  )}
                </button>
                <button
                  onClick={resetState}
                  className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]"
                >
                  🗑️ {t('pages_watermark_config_resetButton')}
                </button>
              </div>

              {/* 进度条 */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
                    <span>{t('pages_watermark_config_progress')}</span>
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
              ✅ {t('pages_watermark_result_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  📼 {t('pages_watermark_result_original')}
                </h3>
                <video
                  src={URL.createObjectURL(selectedFile!)}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  🎬 {t('pages_watermark_result_processed')}
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
                📥 {t('pages_watermark_result_downloadButton')}
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]">
                🔄 {t('pages_watermark_result_reprocessButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WatermarkPage