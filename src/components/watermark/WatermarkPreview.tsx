import React, { useState, useEffect, useMemo } from 'react'

interface WatermarkPreviewProps {
  videoFile: File | null
  // 图片水印属性
  watermarkImage?: File | null
  size?: number
  // 文字水印属性
  watermarkText?: string
  fontSize?: number
  fontColor?: string
  fontFamily?: string
  backgroundColor?: string
  borderWidth?: number
  borderColor?: string
  shadow?: boolean
  // 通用属性
  opacity: number
  position: {
    displayX: number      // 显示坐标（用于预览）
    displayY: number
    actualX: number       // 实际分辨率坐标（用于 FFmpeg）
    actualY: number
  }
  onPositionChange: (position: {
    displayX: number
    displayY: number
    actualX: number
    actualY: number
  }) => void
  videoWidth?: number
  videoHeight?: number
  onVideoLoaded?: (width: number, height: number) => void
  // 水印类型
  type?: 'image' | 'text'
}

const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  videoFile,
  watermarkImage,
  size = 50,
  watermarkText = '',
  fontSize = 24,
  fontColor = '#FFFFFF',
  fontFamily = '',
  backgroundColor = '',
  borderWidth = 0,
  borderColor = '#000000',
  shadow = false,
  opacity,
  position,
  onPositionChange,
  videoWidth,
  videoHeight,
  onVideoLoaded,
  type = 'image'
}) => {
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const [watermarkImageError, setWatermarkImageError] = useState(false)
  
  // 使用useMemo缓存URL.createObjectURL的结果，避免频繁重新创建
  const videoUrl = useMemo(() => {
    if (videoFile) {
      return URL.createObjectURL(videoFile)
    }
    return null
  }, [videoFile])
  
  const watermarkImageUrl = useMemo(() => {
    if (watermarkImage) {
      return URL.createObjectURL(watermarkImage)
    }
    return null
  }, [watermarkImage])
  
  // 清理URL.createObjectURL创建的URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (watermarkImageUrl) {
        URL.revokeObjectURL(watermarkImageUrl)
      }
    }
  }, [videoUrl, watermarkImageUrl])

  // 处理水印拖拽
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingWatermark) return
      
      const videoContainer = document.querySelector('.watermark-preview-container')
      if (!videoContainer) return
      
      const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
      if (!videoElement) return
      
      const videoRect = videoElement.getBoundingClientRect()
      
      // 计算鼠标相对于视频元素的位置（显示尺寸）
      const displayX = e.clientX - videoRect.left
      const displayY = e.clientY - videoRect.top
      
      // 限制在视频元素范围内
      const maxX = videoRect.width
      const maxY = videoRect.height
      
      // 获取视频实际分辨率
      const actualVideoWidth = videoWidth || videoElement.videoWidth || videoRect.width
      const actualVideoHeight = videoHeight || videoElement.videoHeight || videoRect.height
      
      // 将显示尺寸坐标换算成实际分辨率坐标
      const scaleX = actualVideoWidth / videoRect.width
      const scaleY = actualVideoHeight / videoRect.height
      
      const actualX = Math.max(0, Math.min(displayX, maxX)) * scaleX
      const actualY = Math.max(0, Math.min(displayY, maxY)) * scaleY
      
      onPositionChange({
        displayX: parseFloat(displayX.toFixed(2)),
        displayY: parseFloat(displayY.toFixed(2)),
        actualX: parseFloat(actualX.toFixed(2)),
        actualY: parseFloat(actualY.toFixed(2))
      })
    }
    
    const handleMouseUp = () => {
      setIsDraggingWatermark(false)
    }
    
    // 添加事件监听器
    if (isDraggingWatermark) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    // 清理事件监听器
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingWatermark, onPositionChange, videoWidth, videoHeight])

  // 计算显示坐标（将实际分辨率坐标换算回显示坐标）
  const getDisplayPosition = () => {
    const videoContainer = document.querySelector('.watermark-preview-container')
    if (!videoContainer) return { x: position.displayX, y: position.displayY }
    
    const videoElement = videoContainer.querySelector('video') as HTMLVideoElement
    if (!videoElement) return { x: position.displayX, y: position.displayY }
    
    const videoRect = videoElement.getBoundingClientRect()
    
    // 获取视频实际分辨率
    const actualVideoWidth = videoWidth || videoElement.videoWidth || videoRect.width
    const actualVideoHeight = videoHeight || videoElement.videoHeight || videoRect.height
    
    // 将实际分辨率坐标换算成显示坐标
    const displayX = position.actualX * (videoRect.width / actualVideoWidth)
    const displayY = position.actualY * (videoRect.height / actualVideoHeight)
    
    return { x: displayX, y: displayY }
  }

  if (!videoFile || (type === 'image' && !watermarkImage)) {
    return null
  }

  // 对于文字水印，只需要视频文件即可显示预览

  return (
    <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
      <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
        👁️ 水印预览
      </h2>
      
      <div className="watermark-preview-container relative">
        {/* 视频预览 */}
        <video
          ref={(ref) => {
            if (ref) {
              ref.onloadedmetadata = () => {
                setVideoDimensions({ width: ref.videoWidth, height: ref.videoHeight })
                // 调用回调通知父组件视频分辨率
                if (onVideoLoaded) {
                  onVideoLoaded(ref.videoWidth, ref.videoHeight)
                }
              }
            }
          }}
          src={videoUrl || ''}
          controls
          className="w-full rounded-lg"
        />
        
        {/* 水印预览叠加层 */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            opacity: opacity / 100,
          }}
        >
          {type === 'image' && (
            <>
              {watermarkImageUrl && !watermarkImageError ? (
                <img
                  src={watermarkImageUrl}
                  alt="水印预览"
                  className="absolute cursor-move pointer-events-auto"
                  style={{
                    left: `${getDisplayPosition().x}px`,
                    top: `${getDisplayPosition().y}px`,
                    width: `${size}%`,
                    maxWidth: '200px'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsDraggingWatermark(true)
                  }}
                  onError={() => setWatermarkImageError(true)}
                />
              ) : (
                <div
                  className="absolute cursor-move pointer-events-auto bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm"
                  style={{
                    left: `${getDisplayPosition().x}px`,
                    top: `${getDisplayPosition().y}px`,
                    width: '100px',
                    height: '100px'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsDraggingWatermark(true)
                  }}
                >
                  水印图片加载失败
                </div>
              )}
            </>
          )}
          {type === 'text' && (
            <div
              className="absolute cursor-move pointer-events-auto select-none whitespace-nowrap"
              style={{
                left: `${getDisplayPosition().x}px`,
                top: `${getDisplayPosition().y}px`,
                fontSize: `${fontSize}px`,
                color: fontColor,
                fontFamily: fontFamily || 'inherit',
                backgroundColor: backgroundColor || 'transparent',
                padding: backgroundColor ? '4px 8px' : '0',
                borderRadius: '4px',
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
                textShadow: shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                setIsDraggingWatermark(true)
              }}
            >
              {watermarkText || '示例文字'}
            </div>
          )}
        </div>
        
        {/* 水印位置信息 */}
        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            水印位置: X={position.displayX.toFixed(2)}px, Y={position.displayY.toFixed(2)}px
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            拖拽水印图片调整位置
          </p>
        </div>
      </div>
    </div>
  )
}

export default WatermarkPreview