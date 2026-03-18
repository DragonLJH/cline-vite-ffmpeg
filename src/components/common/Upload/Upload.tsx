import React, { useState, useRef, useCallback, useEffect } from 'react'
import { UploadProps, FileItem, FileCategory } from './types'

// 文件类型配置映射
const FILE_TYPE_CONFIG: Record<string, { category: FileCategory; icon: string }> = {
  // 图片类型
  'image': { category: 'image', icon: '🖼️' },
  // 音频类型
  'audio': { category: 'audio', icon: '🎵' },
  // 视频类型
  'video': { category: 'video', icon: '🎬' },
  // 文档类型
  'pdf': { category: 'document', icon: '📄' },
  'word': { category: 'document', icon: '📝' },
  'excel': { category: 'document', icon: '📊' },
  'powerpoint': { category: 'document', icon: '📑' },
  'text': { category: 'document', icon: '📃' },
  // 压缩包类型
  'zip': { category: 'archive', icon: '📦' },
  'rar': { category: 'archive', icon: '📦' },
  '7z': { category: 'archive', icon: '📦' },
  'tar': { category: 'archive', icon: '📦' },
  'gz': { category: 'archive', icon: '📦' },
  // 默认
  'default': { category: 'other', icon: '📎' }
}

// MIME 类型到扩展名的映射
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
  'audio/aac': 'aac',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/gzip': 'gz'
}

/**
 * 根据文件名或 MIME 类型获取文件扩展名
 */
const getFileExtension = (fileName: string, mimeType?: string): string => {
  // 优先从文件名获取扩展名
  const nameParts = fileName.split('.')
  if (nameParts.length > 1) {
    return nameParts.pop()?.toLowerCase() || ''
  }
  
  // 从 MIME 类型获取扩展名
  if (mimeType && MIME_TO_EXTENSION[mimeType]) {
    return MIME_TO_EXTENSION[mimeType]
  }
  
  return ''
}

/**
 * 根据扩展名获取文件类型配置
 */
const getFileTypeConfig = (extension: string, mimeType?: string): { category: FileCategory; icon: string } => {
  // 检查 MIME 类型前缀
  if (mimeType) {
    const mimePrefix = mimeType.split('/')[0]
    if (mimePrefix === 'image' || mimePrefix === 'audio' || mimePrefix === 'video') {
      return FILE_TYPE_CONFIG[mimePrefix]
    }
  }
  
  // 检查扩展名
  if (extension) {
    // 图片扩展名
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'avif'].includes(extension)) {
      return FILE_TYPE_CONFIG['image']
    }
    // 音频扩展名
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(extension)) {
      return FILE_TYPE_CONFIG['audio']
    }
    // 视频扩展名
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'm4v'].includes(extension)) {
      return FILE_TYPE_CONFIG['video']
    }
    // PDF
    if (extension === 'pdf') {
      return FILE_TYPE_CONFIG['pdf']
    }
    // Word 文档
    if (['doc', 'docx'].includes(extension)) {
      return FILE_TYPE_CONFIG['word']
    }
    // Excel 表格
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return FILE_TYPE_CONFIG['excel']
    }
    // PowerPoint 演示文稿
    if (['ppt', 'pptx'].includes(extension)) {
      return FILE_TYPE_CONFIG['powerpoint']
    }
    // 文本文件
    if (['txt', 'md', 'log', 'json', 'xml', 'yaml', 'yml', 'ini', 'conf'].includes(extension)) {
      return FILE_TYPE_CONFIG['text']
    }
    // 压缩包
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
      return FILE_TYPE_CONFIG[extension] || FILE_TYPE_CONFIG['zip']
    }
  }
  
  return FILE_TYPE_CONFIG['default']
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 判断是否为媒体文件（支持预览）
 */
const isMediaFile = (category: FileCategory): boolean => {
  return category === 'image' || category === 'audio' || category === 'video'
}

/**
 * 上传组件
 */
const Upload: React.FC<UploadProps> = ({
  label,
  accept,
  multiple = false,
  maxSize,
  value,
  onChange,
  onError,
  disabled = false,
  showPreview = true,
  className = '',
  // 兼容旧 API 的属性
  uploadText,
  buttonText,
  showFileList = true,
  onFileSelect,
  ...props
}) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步外部 value 到内部状态
  useEffect(() => {
    if (value !== undefined) {
      if (value === null) {
        setFiles([])
      } else if (Array.isArray(value)) {
        const newFileItems: FileItem[] = value.map(file => {
          const extension = getFileExtension(file.name, file.type)
          const config = getFileTypeConfig(extension, file.type)
          const previewUrl = isMediaFile(config.category) ? URL.createObjectURL(file) : undefined
          return { file, category: config.category, previewUrl }
        })
        setFiles(newFileItems)
      } else {
        const extension = getFileExtension(value.name, value.type)
        const config = getFileTypeConfig(extension, value.type)
        const previewUrl = isMediaFile(config.category) ? URL.createObjectURL(value) : undefined
        setFiles([{ file: value, category: config.category, previewUrl }])
      }
    }
  }, [value])

  // 清理预览 URL
  useEffect(() => {
    return () => {
      files.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [])

  /**
   * 验证文件
   */
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件大小
    if (maxSize && file.size > maxSize) {
      return `文件 "${file.name}" 超过最大限制 ${formatFileSize(maxSize)}`
    }
    
    // 检查文件类型
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase())
      const fileExtension = getFileExtension(file.name, file.type)
      const mimeType = file.type.toLowerCase()
      
      const isAccepted = acceptedTypes.some(type => {
        // 检查通配符，如 image/*
        if (type.endsWith('/*')) {
          const mainType = type.replace('/*', '')
          return mimeType.startsWith(mainType + '/')
        }
        // 检查扩展名，如 .jpg
        if (type.startsWith('.')) {
          return fileExtension === type.slice(1).toLowerCase()
        }
        // 检查完整 MIME 类型
        return mimeType === type
      })
      
      if (!isAccepted) {
        return `文件 "${file.name}" 类型不支持`
      }
    }
    
    return null
  }, [accept, maxSize])

  /**
   * 处理文件选择
   */
  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    
    const validFiles: FileItem[] = []
    let errorMessage: string | null = null
    
    Array.from(newFiles).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errorMessage = error
        return
      }
      
      const extension = getFileExtension(file.name, file.type)
      const config = getFileTypeConfig(extension, file.type)
      const previewUrl = isMediaFile(config.category) ? URL.createObjectURL(file) : undefined
      
      validFiles.push({
        file,
        category: config.category,
        previewUrl
      })
    })
    
    if (errorMessage && onError) {
      onError(errorMessage)
    }
    
    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
      
      // 清理旧的预览 URL
      if (!multiple) {
        files.forEach(item => {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl)
          }
        })
      }
      
      setFiles(updatedFiles)
      
      // Debug log
      console.log('[Upload] Files selected:', validFiles.map(f => f.file.name))
      console.log('[Upload] Calling onChange with:', multiple ? updatedFiles.map(f => f.file) : updatedFiles[0].file)
      
      onChange?.(multiple ? updatedFiles.map(f => f.file) : updatedFiles[0].file)
      
      // 兼容旧 API：调用 onFileSelect
      if (onFileSelect) {
        console.log('[Upload] Calling onFileSelect with:', validFiles.map(f => f.file))
        onFileSelect(validFiles.map(f => f.file))
      }
    }
  }, [files, multiple, validateFile, onChange, onError])

  /**
   * 处理输入框变化
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // 重置 input 值，允许重复选择同一文件
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [handleFiles])

  /**
   * 处理拖拽
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return
    
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  /**
   * 删除文件
   */
  const handleRemove = useCallback((index: number) => {
    const newFiles = [...files]
    const removedItem = newFiles.splice(index, 1)[0]
    
    // 清理预览 URL
    if (removedItem.previewUrl) {
      URL.revokeObjectURL(removedItem.previewUrl)
    }
    
    setFiles(newFiles)
    onChange?.(multiple ? newFiles.map(f => f.file) : null)
  }, [files, multiple, onChange])

  /**
   * 点击上传区域
   */
  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  /**
   * 渲染文件预览
   */
  const renderPreview = useCallback((item: FileItem) => {
    if (!showPreview || !isMediaFile(item.category)) {
      return null
    }
    
    const { file, previewUrl, category } = item
    
    if (category === 'image' && previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      )
    }
    
    if (category === 'audio' && previewUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <audio
            src={previewUrl}
            controls
            className="w-full max-w-[120px]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
    }
    
    if (category === 'video' && previewUrl) {
      return (
        <video
          src={previewUrl}
          className="w-full h-full object-cover"
          muted
          loop
          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
          onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
        />
      )
    }
    
    return null
  }, [showPreview])

  /**
   * 渲染文件项
   */
  const renderFileItem = useCallback((item: FileItem, index: number) => {
    const extension = getFileExtension(item.file.name, item.file.type)
    const config = getFileTypeConfig(extension, item.file.type)
    const hasPreview = showPreview && isMediaFile(item.category) && item.previewUrl
    
    return (
      <div
        key={`${item.file.name}-${item.file.size}-${index}`}
        className={`
          flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg
          border border-[var(--border-primary)] transition-all
          hover:shadow-md group
        `}
      >
        {/* 预览区域 */}
        <div className={`
          w-12 h-12 flex-shrink-0 rounded-md overflow-hidden
          bg-[var(--bg-primary)] flex items-center justify-center
          ${hasPreview ? '' : 'text-2xl'}
        `}>
          {hasPreview ? renderPreview(item) : <span>{config.icon}</span>}
        </div>
        
        {/* 文件信息 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate">
            {item.file.name}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            {formatFileSize(item.file.size)} · {extension.toUpperCase() || '未知类型'}
          </div>
          {/* 置灰的文件路径信息 */}
          <div className="text-xs text-[var(--text-secondary)] opacity-60 mt-0.5 truncate">
            {item.file.webkitRelativePath || item.file.name}
          </div>
        </div>
        
        {/* 删除按钮 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove(index)
          }}
          className={`
            p-2 rounded-md text-red-500 hover:text-red-700
            hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100
            focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500
          `}
          disabled={disabled}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    )
  }, [showPreview, renderPreview, handleRemove, disabled])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      
      {/* 上传区域 */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          transition-all cursor-pointer
          ${disabled 
            ? 'border-[var(--border-primary)] opacity-50 cursor-not-allowed' 
            : isDragging
              ? 'border-blue-500 bg-blue-50/10'
              : 'border-[var(--border-primary)] hover:border-blue-500 hover:bg-blue-50/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />
        
        <div className="flex flex-col items-center gap-2 text-center">
          {/* 上传图标 */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}
          `}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          {/* 提示文字 */}
          <div>
            <p className="text-sm text-[var(--text-primary)]">
              {isDragging ? '松开鼠标上传文件' : '点击或拖拽文件到此区域上传'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {accept ? `支持格式：${accept}` : '支持所有格式'}
              {maxSize && ` · 最大 ${formatFileSize(maxSize)}`}
              {multiple && ' · 支持多选'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {files.map((item, index) => renderFileItem(item, index))}
        </div>
      )}
    </div>
  )
}

export default Upload