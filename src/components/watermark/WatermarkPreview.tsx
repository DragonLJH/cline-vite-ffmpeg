import React, { useState, useEffect, useMemo } from 'react'

interface WatermarkPreviewProps {
  videoFile: File | null
  watermarkImage: File | null
  opacity: number
  size: number
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
}

const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  videoFile,
  watermarkImage,
  opacity,
  size,
  position,
  onPositionChange
}) => {
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  
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
      const containerRect = videoContainer.getBoundingClientRect()
      
      // 计算视频元素相对于容器的偏移
      const videoOffsetX = videoRect.left - containerRect.left
      const videoOffsetY = videoRect.top - containerRect.top
      
      // 计算鼠标相对于视频元素的位置
      const x = e.clientX - videoRect.left
      const y = e.clientY - videoRect.top
      
      // 限制在视频元素范围内
      const maxX = videoRect.width
      const maxY = videoRect.height
      
      onPositionChange({
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
      })
    }
    
    const handleMouseUp = () => {
      setIsDraggingWatermark(false)
    }
    
    if (isDraggingWatermark) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingWatermark, onPositionChange])

  if (!videoFile || !watermarkImage) {
    return null
  }

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
          <img
            src={watermarkImageUrl || ''}
            alt="水印预览"
            className="absolute cursor-move pointer-events-auto"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size}%`,
              maxWidth: '200px',
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsDraggingWatermark(true)
            }}
          />
        </div>
        
        {/* 水印位置信息 */}
        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            水印位置: X={Math.round(position.x)}px, Y={Math.round(position.y)}px
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