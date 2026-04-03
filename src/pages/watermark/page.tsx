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
    watermarks,
    videoInfo,
    outputDir,
    outputFileName,
    processedFile,
    processedFilePath,
    isProcessing,
    progress,
    initStore,
    setSelectedFile,
    addWatermark,
    updateWatermark,
    removeWatermark,
    setOutputDir,
    setOutputFileName,
    processWatermarks,
    resetState
  } = useWatermarkStore()
  
  // 水印配置状态（用于预览）
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  const [opacity, setOpacity] = useState(50)
  const [size, setSize] = useState(50)
  
  // 水印预览状态
  const [watermarkPreviewPosition, setWatermarkPreviewPosition] = useState({ 
    displayX: 10, 
    displayY: 10,
    actualX: 10,
    actualY: 10
  })
  const [videoResolution, setVideoResolution] = useState({ width: 0, height: 0 })
  
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
  
  // 当用户拖拽水印时，同步更新预览位置
  const handleWatermarkPreviewPositionChange = (newPosition: { 
    displayX: number
    displayY: number
    actualX: number
    actualY: number
  }) => {
    setWatermarkPreviewPosition(newPosition)
  }

  // 添加水印到列表
  const handleAddWatermark = () => {
    if (!watermarkImage) return
    
    addWatermark({
      image: watermarkImage,
      position: { x: watermarkPreviewPosition.actualX, y: watermarkPreviewPosition.actualY },
      opacity,
      size,
      startTime: 0,
      endTime: videoInfo?.duration || 0
    })
    
    // 重置预览状态
    setWatermarkImage(null)
    setOpacity(50)
    setSize(50)
    setWatermarkPreviewPosition({ displayX: 10, displayY: 10, actualX: 10, actualY: 10 })
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
                videoWidth={videoResolution.width}
                videoHeight={videoResolution.height}
                onVideoLoaded={(width, height) => setVideoResolution({ width, height })}
              />
            )}
          </div>

          {/* 右侧：水印配置区域 */}
          <WatermarkConfig
            watermarks={watermarks}
            videoDuration={videoInfo?.duration || 0}
            videoFile={selectedFile}
            outputFileName={outputFileName || ''}
            isProcessing={isProcessing}
            progress={progress}
            canProcess={!!selectedFile && watermarks.length > 0 && !!outputDir && !!outputFileName}
            onAddWatermark={addWatermark}
            onRemoveWatermark={removeWatermark}
            onUpdateWatermark={(id, updates) => {
              updateWatermark(id, updates)
            }}
            onOutputFileNameChange={setOutputFileName}
            onProcess={processWatermarks}
            onReset={resetState}
          />
        </div>

        {/* 结果展示区域 */}
        {processedFile && (
          <ResultDisplay
            originalFile={selectedFile}
            processedFile={processedFile}
            processedFilePath={processedFilePath}
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