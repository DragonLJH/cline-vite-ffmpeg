import React, { useState, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useWatermarkStore } from '@/stores/watermarkStore'
import {
  VideoUpload,
  WatermarkPreview,
  WatermarkConfig,
  ResultDisplay
} from '@/components/watermark'

const WatermarkPage: React.FC = () => {
  const { t } = useTranslation()
  const {
    selectedFile,
    watermarkImage,
    outputDir,
    outputFileName,
    processedFile,
    isProcessing,
    progress,
    initStore,
    setSelectedFile,
    setWatermarkImage,
    setOutputDir,
    setOutputFileName,
    addWatermark,
    resetState
  } = useWatermarkStore()
  
  // 水印配置状态
  const [watermarkText, setWatermarkText] = useState('')
  const [position, setPosition] = useState('topLeft')
  const [opacity, setOpacity] = useState(50)
  const [size, setSize] = useState(50)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  // 水印预览状态
  const [watermarkPreviewPosition, setWatermarkPreviewPosition] = useState({ x: 10, y: 10 })
  
  // 坐标转位置字符串
  const coordsToPosition = (x: number, y: number): string => {
    // 获取视频元素以计算实际尺寸
    const videoElement = document.querySelector('.watermark-preview-container video') as HTMLVideoElement
    if (!videoElement) return 'custom'
    
    const videoWidth = videoElement.videoWidth || videoElement.clientWidth
    const videoHeight = videoElement.videoHeight || videoElement.clientHeight
    
    // 计算相对位置（百分比）
    const xPercent = (x / videoWidth) * 100
    const yPercent = (y / videoHeight) * 100
    
    // 判断位置
    if (xPercent < 20 && yPercent < 20) return 'topLeft'
    if (xPercent > 80 && yPercent < 20) return 'topRight'
    if (xPercent < 20 && yPercent > 80) return 'bottomLeft'
    if (xPercent > 80 && yPercent > 80) return 'bottomRight'
    if (xPercent > 40 && xPercent < 60 && yPercent > 40 && yPercent < 60) return 'center'
    
    return 'custom'
  }
  
  // 位置字符串转坐标
  const positionToCoords = (pos: string): { x: number; y: number } => {
    const videoElement = document.querySelector('.watermark-preview-container video') as HTMLVideoElement
    if (!videoElement) return { x: 10, y: 10 }
    
    const videoWidth = videoElement.videoWidth || videoElement.clientWidth
    const videoHeight = videoElement.videoHeight || videoElement.clientHeight
    
    switch (pos) {
      case 'topLeft':
        return { x: 10, y: 10 }
      case 'topRight':
        return { x: videoWidth - 10, y: 10 }
      case 'bottomLeft':
        return { x: 10, y: videoHeight - 10 }
      case 'bottomRight':
        return { x: videoWidth - 10, y: videoHeight - 10 }
      case 'center':
        return { x: videoWidth / 2, y: videoHeight / 2 }
      default:
        return { x: 10, y: 10 }
    }
  }

  const handleSelectOutputDir = async () => {
    try {
      const result = await window.electronAPI.openFileDialog({
        title: '选择输出目录',
        properties: ['openDirectory']
      })

      if (result && result.length > 0) {
        setOutputDir(result[0])
      }
    } catch (error) {
      // 处理错误
    }
  }

  // 组件挂载时初始化 store
  useEffect(() => {
    initStore()
  }, [])
  
  // 当用户拖拽水印时，同步更新position状态
  const handleWatermarkPreviewPositionChange = (newPosition: { x: number; y: number }) => {
    setWatermarkPreviewPosition(newPosition)
    // 同步更新position状态
    const newPositionString = coordsToPosition(newPosition.x, newPosition.y)
    setPosition(newPositionString)
  }
  
  // 当用户在配置区选择位置时，同步更新watermarkPreviewPosition状态
  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition)
    // 同步更新watermarkPreviewPosition状态
    const newCoords = positionToCoords(newPosition)
    setWatermarkPreviewPosition(newCoords)
  }

  const handleProcessWatermark = async () => {
    if (!selectedFile || !watermarkImage || !outputDir || !outputFileName) {
      return
    }

    await addWatermark({
      text: watermarkText,
      position,
      opacity,
      size,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      x: watermarkPreviewPosition.x,
      y: watermarkPreviewPosition.y
    })
  }

  const handleDownload = () => {
    // 下载处理后的文件
    // 实际实现需要根据项目需求
  }

  const handleReprocess = () => {
    // 重新处理
    resetState()
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      <div className="w-full flex-1 overflow-y-auto">
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
          {/* 左侧：视频上传和预览区域 */}
          <div className="space-y-8">
            <VideoUpload
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
            
            {/* 水印预览区域 */}
            {selectedFile && watermarkImage && (
              <WatermarkPreview
                videoFile={selectedFile}
                watermarkImage={watermarkImage}
                opacity={opacity}
                size={size}
                position={watermarkPreviewPosition}
                onPositionChange={handleWatermarkPreviewPositionChange}
              />
            )}
          </div>

          {/* 右侧：水印配置区域 */}
          <WatermarkConfig
            watermarkImage={watermarkImage}
            watermarkText={watermarkText}
            position={position}
            opacity={opacity}
            size={size}
            startTime={startTime}
            endTime={endTime}
            outputFileName={outputFileName || ''}
            isProcessing={isProcessing}
            progress={progress}
            canProcess={!!selectedFile && !!watermarkImage && !!outputDir && !!outputFileName}
            onWatermarkImageSelect={setWatermarkImage}
            onWatermarkTextChange={setWatermarkText}
            onPositionChange={handlePositionChange}
            onOpacityChange={setOpacity}
            onSizeChange={setSize}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onOutputFileNameChange={setOutputFileName}
            onProcess={handleProcessWatermark}
            onReset={resetState}
          />
        </div>

        {/* 结果展示区域 */}
        {processedFile && (
          <ResultDisplay
            originalFile={selectedFile}
            processedFile={processedFile}
            onDownload={handleDownload}
            onReprocess={handleReprocess}
          />
        )}
      </div>

      {/* 底部输出目录栏 */}
      <div className="flex-none h-16 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">📁 输出目录:</span>
            <span className="text-sm text-[var(--text-primary)] opacity-60">
              {outputDir || '未设置输出目录'}
            </span>
          </div>
          <button
            onClick={handleSelectOutputDir}
            className="px-4 py-2 bg-[var(--btn-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-card)] text-sm"
          >
            修改目录
          </button>
        </div>
      </div>
    </div>
  )
}

export default WatermarkPage