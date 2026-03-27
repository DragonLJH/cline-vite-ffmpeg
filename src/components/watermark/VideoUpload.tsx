import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import Upload from '@/components/common/Upload'

interface VideoUploadProps {
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
}

const VideoUpload: React.FC<VideoUploadProps> = ({ selectedFile, onFileSelect }) => {
  const { t } = useTranslation()
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // 使用useMemo缓存URL.createObjectURL的结果，避免频繁重新创建
  const videoUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile)
    }
    return null
  }, [selectedFile])
  
  // 清理URL.createObjectURL创建的URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])
  
  // 组件卸载时清理视频元素
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      }
    }
  }, [])

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileChange = (file: File | File[] | null) => {
    if (file && !Array.isArray(file)) {
      onFileSelect(file)
    }
  }

  return (
    <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
      <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
        📁 {t('pages_watermark_upload_title')}
      </h2>

      {/* 视频上传或预览 */}
      {!selectedFile ? (
        <Upload
          accept="video/*"
          maxSize={100 * 1024 * 1024} // 100MB
          multiple={false}
          uploadText={t('pages_watermark_upload_dropTitle')}
          buttonText={t('pages_watermark_upload_selectButton')}
          showFileList={false}
          onFileSelect={handleFileSelect}
          onChange={handleFileChange}
          className="upload-video-area"
        />
      ) : (
        <div className="relative">
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
          
          {/* 重新选择按钮 */}
          <button
            onClick={() => onFileSelect(null)}
            className="absolute top-4 right-4 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-card)] text-sm"
          >
            🔄 重新选择
          </button>
          
          {/* 视频尺寸信息 */}
          {videoDimensions.width > 0 && (
            <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-sm text-[var(--text-secondary)]">
                视频尺寸: {videoDimensions.width} × {videoDimensions.height} px
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoUpload