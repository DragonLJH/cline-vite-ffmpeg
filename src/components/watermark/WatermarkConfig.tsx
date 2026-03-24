import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import Upload from '@/components/common/Upload'

interface WatermarkConfigProps {
  watermarkImage: File | null
  watermarkText: string
  position: string
  opacity: number
  size: number
  startTime: string
  endTime: string
  watermarkSize: number
  outputFileName: string
  isProcessing: boolean
  progress: number
  canProcess: boolean
  onWatermarkImageSelect: (file: File | null) => void
  onWatermarkTextChange: (text: string) => void
  onPositionChange: (position: string) => void
  onOpacityChange: (opacity: number) => void
  onSizeChange: (size: number) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onWatermarkSizeChange: (size: number) => void
  onOutputFileNameChange: (name: string) => void
  onProcess: () => void
  onReset: () => void
}

const WatermarkConfig: React.FC<WatermarkConfigProps> = ({
  watermarkImage,
  watermarkText,
  position,
  opacity,
  size,
  startTime,
  endTime,
  watermarkSize,
  outputFileName,
  isProcessing,
  progress,
  canProcess,
  onWatermarkImageSelect,
  onWatermarkTextChange,
  onPositionChange,
  onOpacityChange,
  onSizeChange,
  onStartTimeChange,
  onEndTimeChange,
  onWatermarkSizeChange,
  onOutputFileNameChange,
  onProcess,
  onReset
}) => {
  const { t } = useTranslation()

  const handleWatermarkImageSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        onWatermarkImageSelect(file)
      }
    }
  }

  const handleWatermarkImageChange = (file: File | File[] | null) => {
    if (file && !Array.isArray(file)) {
      if (file.type.startsWith('image/')) {
        onWatermarkImageSelect(file)
      }
    }
  }

  return (
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
            onFileSelect={handleWatermarkImageSelect}
            onChange={handleWatermarkImageChange}
          />
          {watermarkImage && (
            <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded">
              <p className="text-sm text-[var(--text-secondary)]">
                已选择: {watermarkImage.name}
              </p>
            </div>
          )}
        </div>

        {/* 输出文件名 */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            📄 输出文件名
          </label>
          <input
            type="text"
            value={outputFileName || ''}
            onChange={(e) => onOutputFileNameChange(e.target.value)}
            placeholder="输入文件名..."
            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            💬 {t('pages_watermark_config_watermarkText')}
          </label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => onWatermarkTextChange(e.target.value)}
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
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
          >
            <option value="topLeft">{t('pages_watermark_config_positions_topLeft')}</option>
            <option value="topRight">{t('pages_watermark_config_positions_topRight')}</option>
            <option value="bottomLeft">{t('pages_watermark_config_positions_bottomLeft')}</option>
            <option value="bottomRight">{t('pages_watermark_config_positions_bottomRight')}</option>
            <option value="center">{t('pages_watermark_config_positions_center')}</option>
            <option value="custom">🎯 自定义位置</option>
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
            onChange={(e) => onOpacityChange(Number(e.target.value))}
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
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-[var(--text-secondary)]">
            <span>{t('pages_watermark_config_sizeSmall')}</span>
            <span>{size}%</span>
            <span>{t('pages_watermark_config_sizeLarge')}</span>
          </div>
        </div>

        {/* 水印时间设置 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              ⏰ 开始时间（秒）
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              ⏰ 结束时间（秒）
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              placeholder="视频总时长"
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
            />
          </div>
        </div>
        
        {/* 时间设置提示 */}
        <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
          <p className="text-xs text-[var(--text-secondary)]">
            💡 时间设置说明：留空表示从视频开始到结束。设置时间后，水印只会在指定时间段内显示。
          </p>
        </div>

        {/* 水印图片大小 */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            📐 水印图片大小
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={watermarkSize}
            onChange={(e) => onWatermarkSizeChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-[var(--text-secondary)]">
            <span>10%</span>
            <span>{watermarkSize}%</span>
            <span>200%</span>
          </div>
        </div>

        {/* 处理按钮 */}
        <div className="flex gap-4">
          <button
            onClick={onProcess}
            disabled={!canProcess || isProcessing}
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
            onClick={onReset}
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
  )
}

export default WatermarkConfig