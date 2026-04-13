import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import Upload from '@/components/common/Upload'
import TimeRangeSlider from '../common/TimeRangeSlider'
import TextWatermarkEditor from './TextWatermarkEditor'

// 水印类型
type WatermarkType = 'image' | 'text'

// 基础水印接口
interface BaseWatermarkItemType {
  id: string
  type: WatermarkType
  position: { x: number; y: number }
  opacity: number
  startTime: number
  endTime: number
}

// 图片水印
interface ImageWatermarkItemType extends BaseWatermarkItemType {
  type: 'image'
  image: File | null
  size: number
}

// 文字水印
interface TextWatermarkItemType extends BaseWatermarkItemType {
  type: 'text'
  text: string
  fontSize: number
  fontColor: string
  fontFamily?: string
  backgroundColor?: string
  borderWidth?: number
  borderColor?: string
  shadow: boolean
}

type WatermarkItemType = ImageWatermarkItemType | TextWatermarkItemType

// 水印项组件
interface WatermarkItemProps {
  watermark: WatermarkItemType
  index: number
  videoFile: File | null
  videoDuration: number
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<WatermarkItemType>) => void
}

const WatermarkItemComponent: React.FC<WatermarkItemProps> = ({
  watermark,
  index,
  videoFile,
  videoDuration,
  onRemove,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localPosition, setLocalPosition] = useState(watermark.position)
  const [localOpacity, setLocalOpacity] = useState(watermark.opacity)
  const [localStartTime, setLocalStartTime] = useState(watermark.startTime)
  const [localEndTime, setLocalEndTime] = useState(watermark.endTime)
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoResolution, setVideoResolution] = useState({ width: 0, height: 0 })

  // 图片水印专用状态
  const [localSize, setLocalSize] = useState(
    watermark.type === 'image' ? watermark.size : 50
  )

  // 文字水印专用状态
  const [localText, setLocalText] = useState(
    watermark.type === 'text' ? watermark.text : ''
  )
  const [localFontSize, setLocalFontSize] = useState(
    watermark.type === 'text' ? watermark.fontSize : 24
  )
  const [localFontColor, setLocalFontColor] = useState(
    watermark.type === 'text' ? watermark.fontColor : '#FFFFFF'
  )
  const [localFontFamily, setLocalFontFamily] = useState(
    watermark.type === 'text' ? watermark.fontFamily : ''
  )
  const [localBackgroundColor, setLocalBackgroundColor] = useState(
    watermark.type === 'text' ? watermark.backgroundColor : ''
  )
  const [localBorderWidth, setLocalBorderWidth] = useState(
    watermark.type === 'text' ? watermark.borderWidth : 0
  )
  const [localBorderColor, setLocalBorderColor] = useState(
    watermark.type === 'text' ? watermark.borderColor : '#000000'
  )
  const [localShadow, setLocalShadow] = useState(
    watermark.type === 'text' ? watermark.shadow : false
  )

  // 处理位置拖拽更新
  const handlePositionChange = (newPosition: { x: number; y: number }) => {
    setLocalPosition(newPosition)
    onUpdate(watermark.id, { position: newPosition })
  }

  // 处理透明度更新
  const handleOpacityChange = (opacity: number) => {
    setLocalOpacity(opacity)
    onUpdate(watermark.id, { opacity })
  }

  // 处理大小更新（图片水印）
  const handleSizeChange = (size: number) => {
    setLocalSize(size)
    if (watermark.type === 'image') {
      onUpdate(watermark.id, { size })
    }
  }

  // 处理时间范围更新
  const handleTimeChange = (startTime: number, endTime: number) => {
    setLocalStartTime(startTime)
    setLocalEndTime(endTime)
    onUpdate(watermark.id, { startTime, endTime })
  }

  // 处理文字水印配置更新
  const handleTextConfigChange = (config: {
    text: string
    fontSize: number
    fontColor: string
    opacity: number
    backgroundColor?: string
    borderWidth?: number
    borderColor?: string
    shadow: boolean
    fontFamily?: string
  }) => {
    setLocalText(config.text)
    setLocalFontSize(config.fontSize)
    setLocalFontColor(config.fontColor)
    setLocalOpacity(config.opacity)
    setLocalBackgroundColor(config.backgroundColor || '')
    setLocalBorderWidth(config.borderWidth || 0)
    setLocalBorderColor(config.borderColor || '#000000')
    setLocalShadow(config.shadow)
    setLocalFontFamily(config.fontFamily || '')

    if (watermark.type === 'text') {
      onUpdate(watermark.id, {
        text: config.text,
        fontSize: config.fontSize,
        fontColor: config.fontColor,
        opacity: config.opacity,
        backgroundColor: config.backgroundColor,
        borderWidth: config.borderWidth,
        borderColor: config.borderColor,
        shadow: config.shadow,
        fontFamily: config.fontFamily
      })
    }
  }

  // 管理水印图片URL
  useEffect(() => {
    if (watermark.image) {
      const url = URL.createObjectURL(watermark.image)
      setWatermarkImageUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setWatermarkImageUrl(null)
    }
  }, [watermark.image])

  // 管理视频URL
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setVideoUrl(null)
    }
  }, [videoFile])

  return (
    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-[var(--text-primary)]">
          水印 {index + 1}: {watermark.type === 'image'
            ? (watermark as ImageWatermarkItemType).image?.name || '未知图片'
            : `文字 - ${(watermark as TextWatermarkItemType).text || '无内容'}`
          }
          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
            watermark.type === 'image'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {watermark.type === 'image' ? '图片' : '文字'}
          </span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            {isEditing ? '完成' : '编辑'}
          </button>
          <button
            onClick={() => onRemove(watermark.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            删除
          </button>
        </div>
      </div>

      {/* 水印预览区域 */}
      {isEditing && videoFile && (
        <div className="mb-4 relative watermark-edit-preview">
          <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '200px' }}>
            <video
              ref={(ref) => {
                if (ref) {
                  ref.onloadedmetadata = () => {
                    setVideoResolution({ width: ref.videoWidth, height: ref.videoHeight })
                  }
                }
              }}
              src={videoUrl || ''}
              className="w-full h-full object-contain"
              muted
            />
            {/* 图片水印预览 */}
            {watermark.type === 'image' && watermarkImageUrl && (
              <img
                src={watermarkImageUrl}
                alt="水印预览"
                className="absolute cursor-move"
                style={{
                  left: `${(() => {
                    const videoContainer = document.querySelector('.watermark-edit-preview')
                    if (!videoContainer) return localPosition.x
                    const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                    if (!videoElement) return localPosition.x
                    const videoRect = videoElement.getBoundingClientRect()
                    const containerRect = videoContainer.getBoundingClientRect()
                    const actualVideoWidth = videoResolution.width || videoRect.width
                    const actualVideoHeight = videoResolution.height || videoRect.height
                    const videoAspect = actualVideoWidth / actualVideoHeight
                    const containerAspect = videoRect.width / videoRect.height
                    let displayWidth, offsetX
                    if (videoAspect > containerAspect) {
                      displayWidth = videoRect.width
                      offsetX = 0
                    } else {
                      displayWidth = videoRect.height * videoAspect
                      offsetX = (videoRect.width - displayWidth) / 2
                    }
                    const scale = displayWidth / actualVideoWidth
                    return offsetX + localPosition.x * scale
                  })()}px`,
                  top: `${(() => {
                    const videoContainer = document.querySelector('.watermark-edit-preview')
                    if (!videoContainer) return localPosition.y
                    const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                    if (!videoElement) return localPosition.y
                    const videoRect = videoElement.getBoundingClientRect()
                    const actualVideoWidth = videoResolution.width || videoRect.width
                    const actualVideoHeight = videoResolution.height || videoRect.height
                    const videoAspect = actualVideoWidth / actualVideoHeight
                    const containerAspect = videoRect.width / videoRect.height
                    let displayHeight, offsetY
                    if (videoAspect > containerAspect) {
                      displayHeight = videoRect.width / videoAspect
                      offsetY = (videoRect.height - displayHeight) / 2
                    } else {
                      displayHeight = videoRect.height
                      offsetY = 0
                    }
                    const scale = displayHeight / actualVideoHeight
                    return offsetY + localPosition.y * scale
                  })()}px`,
                  width: `${localSize}%`,
                  opacity: localOpacity / 100,
                  maxWidth: '100px',
                  maxHeight: '100px'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  const videoContainer = (e.target as HTMLElement).closest('.watermark-edit-preview')
                  if (!videoContainer) return
                  const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                  if (!videoElement) return
                  const videoRect = videoElement.getBoundingClientRect()
                  const actualVideoWidth = videoResolution.width || videoRect.width
                  const actualVideoHeight = videoResolution.height || videoRect.height
                  const videoAspect = actualVideoWidth / actualVideoHeight
                  const containerAspect = videoRect.width / videoRect.height
                  let displayWidth, displayHeight, offsetX, offsetY
                  if (videoAspect > containerAspect) {
                    displayWidth = videoRect.width
                    displayHeight = videoRect.width / videoAspect
                    offsetX = 0
                    offsetY = (videoRect.height - displayHeight) / 2
                  } else {
                    displayWidth = videoRect.height * videoAspect
                    displayHeight = videoRect.height
                    offsetX = (videoRect.width - displayWidth) / 2
                    offsetY = 0
                  }
                  const scale = displayWidth / actualVideoWidth
                  const startX = e.clientX - localPosition.x * scale - offsetX
                  const startY = e.clientY - localPosition.y * scale - offsetY

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const displayX = Math.max(0, moveEvent.clientX - startX - offsetX)
                    const displayY = Math.max(0, moveEvent.clientY - startY - offsetY)
                    const actualX = Math.max(0, Math.min(displayX / scale, actualVideoWidth))
                    const actualY = Math.max(0, Math.min(displayY / scale, actualVideoHeight))
                    handlePositionChange({ x: actualX, y: actualY })
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              />
            )}
            {/* 文字水印预览 */}
            {watermark.type === 'text' && (
              <div
                className="absolute cursor-move select-none"
                style={{
                  left: `${(() => {
                    const videoContainer = document.querySelector('.watermark-edit-preview')
                    if (!videoContainer) return localPosition.x
                    const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                    if (!videoElement) return localPosition.x
                    const videoRect = videoElement.getBoundingClientRect()
                    const actualVideoWidth = videoResolution.width || videoRect.width
                    const actualVideoHeight = videoResolution.height || videoRect.height
                    const videoAspect = actualVideoWidth / actualVideoHeight
                    const containerAspect = videoRect.width / videoRect.height
                    let displayWidth, offsetX
                    if (videoAspect > containerAspect) {
                      displayWidth = videoRect.width
                      offsetX = 0
                    } else {
                      displayWidth = videoRect.height * videoAspect
                      offsetX = (videoRect.width - displayWidth) / 2
                    }
                    const scale = displayWidth / actualVideoWidth
                    return offsetX + localPosition.x * scale
                  })()}px`,
                  top: `${(() => {
                    const videoContainer = document.querySelector('.watermark-edit-preview')
                    if (!videoContainer) return localPosition.y
                    const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                    if (!videoElement) return localPosition.y
                    const videoRect = videoElement.getBoundingClientRect()
                    const actualVideoWidth = videoResolution.width || videoRect.width
                    const actualVideoHeight = videoResolution.height || videoRect.height
                    const videoAspect = actualVideoWidth / actualVideoHeight
                    const containerAspect = videoRect.width / videoRect.height
                    let displayHeight, offsetY
                    if (videoAspect > containerAspect) {
                      displayHeight = videoRect.width / videoAspect
                      offsetY = (videoRect.height - displayHeight) / 2
                    } else {
                      displayHeight = videoRect.height
                      offsetY = 0
                    }
                    const scale = displayHeight / actualVideoHeight
                    return offsetY + localPosition.y * scale
                  })()}px`,
                  fontSize: `${Math.min(localFontSize, 48)}px`,
                  color: localFontColor,
                  opacity: localOpacity / 100,
                  fontFamily: localFontFamily || 'inherit',
                  backgroundColor: localBackgroundColor || 'transparent',
                  padding: localBackgroundColor ? '4px 8px' : '0',
                  borderRadius: '4px',
                  border: localBorderWidth > 0 ? `${localBorderWidth}px solid ${localBorderColor}` : 'none',
                  textShadow: localShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  const videoContainer = (e.target as HTMLElement).closest('.watermark-edit-preview')
                  if (!videoContainer) return
                  const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
                  if (!videoElement) return
                  const videoRect = videoElement.getBoundingClientRect()
                  const actualVideoWidth = videoResolution.width || videoRect.width
                  const actualVideoHeight = videoResolution.height || videoRect.height
                  const videoAspect = actualVideoWidth / actualVideoHeight
                  const containerAspect = videoRect.width / videoRect.height
                  let displayWidth, displayHeight, offsetX, offsetY
                  if (videoAspect > containerAspect) {
                    displayWidth = videoRect.width
                    displayHeight = videoRect.width / videoAspect
                    offsetX = 0
                    offsetY = (videoRect.height - displayHeight) / 2
                  } else {
                    displayWidth = videoRect.height * videoAspect
                    displayHeight = videoRect.height
                    offsetX = (videoRect.width - displayWidth) / 2
                    offsetY = 0
                  }
                  const scale = displayWidth / actualVideoWidth
                  const startX = e.clientX - localPosition.x * scale - offsetX
                  const startY = e.clientY - localPosition.y * scale - offsetY

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const displayX = Math.max(0, moveEvent.clientX - startX - offsetX)
                    const displayY = Math.max(0, moveEvent.clientY - startY - offsetY)
                    const actualX = Math.max(0, Math.min(displayX / scale, actualVideoWidth))
                    const actualY = Math.max(0, Math.min(displayY / scale, actualVideoHeight))
                    handlePositionChange({ x: actualX, y: actualY })
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              >
                {localText || '示例文字'}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            拖拽水印调整位置
          </p>
        </div>
      )}

      {/* 水印属性配置 */}
      {isEditing && (
        <div className="space-y-4">
          {/* 图片水印配置 */}
          {watermark.type === 'image' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  透明度
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localOpacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-[var(--text-secondary)]">{localOpacity}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  大小
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={localSize}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-[var(--text-secondary)]">{localSize}%</span>
              </div>
            </div>
          )}

          {/* 文字水印配置 */}
          {watermark.type === 'text' && (
            <TextWatermarkEditor
              initialText={localText}
              initialFontSize={localFontSize}
              initialFontColor={localFontColor}
              initialOpacity={localOpacity}
              initialBackgroundColor={localBackgroundColor}
              initialBorderWidth={localBorderWidth}
              initialBorderColor={localBorderColor}
              initialShadow={localShadow}
              initialFontFamily={localFontFamily}
              onChange={handleTextConfigChange}
            />
          )}

          {/* 时间范围选择器 */}
          {!!videoDuration && <TimeRangeSlider
            duration={videoDuration}
            startTime={localStartTime}
            endTime={localEndTime}
            onStartTimeChange={(time: number) => handleTimeChange(time, localEndTime)}
            onEndTimeChange={(time: number) => handleTimeChange(localStartTime, time)}
          />}
        </div>
      )}

      {/* 水印信息摘要 */}
      {!isEditing && (
        <div className="grid grid-cols-3 gap-4 text-sm text-[var(--text-secondary)]">
          <div>类型: {watermark.type === 'image' ? '图片' : '文字'}</div>
          <div>位置: ({watermark.position.x.toFixed(0)}, {watermark.position.y.toFixed(0)})</div>
          <div>透明度: {watermark.opacity}%</div>
          {watermark.type === 'image' && (
            <div>大小: {watermark.size}%</div>
          )}
          {watermark.type === 'text' && (
            <>
              <div>文字: {watermark.text || '无'}</div>
              <div>字体: {watermark.fontSize}px</div>
            </>
          )}
          <div>开始: {watermark.startTime.toFixed(1)}s</div>
          <div>结束: {watermark.endTime.toFixed(1)}s</div>
        </div>
      )}
    </div>
  )
}

interface WatermarkConfigProps {
  watermarks: WatermarkItemType[]
  videoDuration: number
  videoFile: File | null
  outputFileName: string
  isProcessing: boolean
  progress: number
  canProcess: boolean
  onAddWatermark: (watermark: Omit<WatermarkItemType, 'id'>) => void
  onRemoveWatermark: (id: string) => void
  onUpdateWatermark: (id: string, updates: Partial<WatermarkItemType>) => void
  onOutputFileNameChange: (name: string) => void
  onProcess: () => void
  onReset: () => void
}

const WatermarkConfig: React.FC<WatermarkConfigProps> = ({
  watermarks,
  videoDuration,
  videoFile,
  outputFileName,
  isProcessing,
  progress,
  canProcess,
  onAddWatermark,
  onRemoveWatermark,
  onUpdateWatermark,
  onOutputFileNameChange,
  onProcess,
  onReset
}) => {
  const { t } = useTranslation()

  // 水印类型选择
  const [newWatermarkType, setNewWatermarkType] = useState<WatermarkType>('image')

  // 图片水印状态
  const [newWatermarkImage, setNewWatermarkImage] = useState<File | null>(null)

  // 文字水印状态
  const [newTextWatermark, setNewTextWatermark] = useState({
    text: '',
    fontSize: 24,
    fontColor: '#FFFFFF',
    fontFamily: '',
    backgroundColor: '',
    borderWidth: 0,
    borderColor: '#000000',
    shadow: false
  })

  // 通用水印状态
  const [newWatermarkPosition, setNewWatermarkPosition] = useState({ x: 10, y: 10 })
  const [newWatermarkOpacity, setNewWatermarkOpacity] = useState(80)
  const [newWatermarkSize, setNewWatermarkSize] = useState(100)
  const [newWatermarkStartTime, setNewWatermarkStartTime] = useState(0)
  const [newWatermarkEndTime, setNewWatermarkEndTime] = useState(videoDuration)

  const handleAddWatermark = () => {
    if (newWatermarkType === 'image') {
      if (!newWatermarkImage) return

      onAddWatermark({
        type: 'image',
        image: newWatermarkImage,
        position: newWatermarkPosition,
        opacity: newWatermarkOpacity,
        size: newWatermarkSize,
        startTime: newWatermarkStartTime,
        endTime: newWatermarkEndTime
      })

      // 重置图片水印表单
      setNewWatermarkImage(null)
    } else {
      if (!newTextWatermark.text.trim()) return

      onAddWatermark({
        type: 'text',
        text: newTextWatermark.text,
        position: newWatermarkPosition,
        opacity: newWatermarkOpacity,
        startTime: newWatermarkStartTime,
        endTime: newWatermarkEndTime,
        fontSize: newTextWatermark.fontSize,
        fontColor: newTextWatermark.fontColor,
        fontFamily: newTextWatermark.fontFamily,
        backgroundColor: newTextWatermark.backgroundColor,
        borderWidth: newTextWatermark.borderWidth,
        borderColor: newTextWatermark.borderColor,
        shadow: newTextWatermark.shadow
      })

      // 重置文字水印表单
      setNewTextWatermark({
        text: '',
        fontSize: 24,
        fontColor: '#FFFFFF',
        fontFamily: '',
        backgroundColor: '',
        borderWidth: 0,
        borderColor: '#000000',
        shadow: false
      })
    }

    // 重置通用状态
    setNewWatermarkPosition({ x: 10, y: 10 })
    setNewWatermarkOpacity(80)
    setNewWatermarkSize(100)
    setNewWatermarkStartTime(0)
    setNewWatermarkEndTime(videoDuration)
  }

  const handleWatermarkImageSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setNewWatermarkImage(file)
      }
    }
  }

  const handleTextConfigChange = (config: typeof newTextWatermark) => {
    setNewTextWatermark(config)
  }

  const canAddWatermark = newWatermarkType === 'image'
    ? !!newWatermarkImage
    : !!newTextWatermark.text.trim()

  return (
    <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
      <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
        ⚙️ {t('pages_watermark_config_title')}
      </h2>

      {/* 添加新水印 */}
      <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-xl">
        <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
          ➕ 添加新水印
        </h3>

        {/* 水印类型选择 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setNewWatermarkType('image')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              newWatermarkType === 'image'
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            🖼️ 图片水印
          </button>
          <button
            onClick={() => setNewWatermarkType('text')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              newWatermarkType === 'text'
                ? 'bg-green-500 text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            📝 文字水印
          </button>
        </div>

        {/* 图片水印上传 */}
        {newWatermarkType === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              选择水印图片
            </label>
            <Upload
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              multiple={false}
              uploadText="拖拽水印图片到此处"
              buttonText="选择水印图片"
              showFileList={false}
              onFileSelect={handleWatermarkImageSelect}
            />
            {newWatermarkImage && (
              <div className="mt-2 p-2 bg-[var(--bg-card)] rounded">
                <p className="text-sm text-[var(--text-secondary)]">
                  已选择: {newWatermarkImage.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 文字水印编辑器 */}
        {newWatermarkType === 'text' && (
          <div className="mb-4">
            <TextWatermarkEditor
              initialText={newTextWatermark.text}
              initialFontSize={newTextWatermark.fontSize}
              initialFontColor={newTextWatermark.fontColor}
              initialOpacity={newWatermarkOpacity}
              initialBackgroundColor={newTextWatermark.backgroundColor}
              initialBorderWidth={newTextWatermark.borderWidth}
              initialBorderColor={newTextWatermark.borderColor}
              initialShadow={newTextWatermark.shadow}
              initialFontFamily={newTextWatermark.fontFamily}
              onChange={(config) => {
                handleTextConfigChange(config)
                setNewWatermarkOpacity(config.opacity)
              }}
            />
          </div>
        )}

        {/* 图片水印特有配置 */}
        {newWatermarkType === 'image' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                透明度
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newWatermarkOpacity}
                onChange={(e) => setNewWatermarkOpacity(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-[var(--text-secondary)]">{newWatermarkOpacity}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                大小
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={newWatermarkSize}
                onChange={(e) => setNewWatermarkSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-[var(--text-secondary)]">{newWatermarkSize}%</span>
            </div>
          </div>
        )}

        {/* 时间范围选择器 */}
        {!!videoDuration && <div className="mb-4">
          <TimeRangeSlider
            duration={videoDuration}
            startTime={newWatermarkStartTime}
            endTime={newWatermarkEndTime}
            onStartTimeChange={(time: number) => setNewWatermarkStartTime(time)}
            onEndTimeChange={(time: number) => setNewWatermarkEndTime(time)}
          />
        </div>}

        {/* 添加按钮 */}
        <button
          onClick={handleAddWatermark}
          disabled={!canAddWatermark}
          className="w-full px-6 py-3 bg-[var(--btn-primary)] text-[var(--text-inverse)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--btn-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ 添加{newWatermarkType === 'image' ? '图片' : '文字'}水印
        </button>
      </div>

      {/* 已添加的水印列表 */}
      {watermarks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
            📋 已添加的水印 ({watermarks.length})
          </h3>
          <div className="space-y-4">
            {watermarks.map((watermark, index) => (
              <WatermarkItemComponent
                key={watermark.id}
                watermark={watermark}
                index={index}
                videoFile={videoFile}
                videoDuration={videoDuration}
                onRemove={onRemoveWatermark}
                onUpdate={onUpdateWatermark}
              />
            ))}
          </div>
        </div>
      )}

      {/* 输出文件名 */}
      <div className="mb-6">
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
              处理中...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              🎬 处理视频
            </span>
          )}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)]"
        >
          🗑️ 重置
        </button>
      </div>

      {/* 进度条 */}
      {isProcessing && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
            <span>处理进度</span>
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
  )
}

export default WatermarkConfig