import React, { useState, useRef, useCallback, useContext, createContext } from 'react'
import { UploadProps, UploadFile, UploadState, UploadContextValue } from './types'
import './Upload.scss'

// 文件路径转换为File对象的辅助函数
const convertFilePathsToFiles = async (filePaths: string[]): Promise<File[]> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available')
  }

  const files: File[] = []
  
  for (const filePath of filePaths) {
    try {
      // 通过主进程读取文件
      const { buffer, fileName } = await window.electronAPI.readFile(filePath)
      
      // 将base64转换为ArrayBuffer
      const binaryString = atob(buffer)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // 创建File对象
      const file = new File([bytes], fileName, {
        type: getFileTypeFromPath(filePath)
      })
      
      files.push(file)
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error)
    }
  }
  
  return files
}

// 根据文件路径推断文件类型
const getFileTypeFromPath = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase()
  
  if (!extension) return 'application/octet-stream'
  
  const typeMap: Record<string, string> = {
    // 图片类型
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // 视频类型
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    
    // 音频类型
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    
    // 文档类型
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'application/xml'
  }
  
  return typeMap[extension] || 'application/octet-stream'
}

// 从accept字符串中提取文件扩展名
const getExtensionsFromAccept = (accept: string): string[] => {
  if (!accept) return []
  
  // 处理常见的accept格式
  const extensions: string[] = []
  
  // 分割accept字符串（支持逗号分隔）
  const acceptTypes = accept.split(',').map(type => type.trim())
  
  for (const type of acceptTypes) {
    if (type.startsWith('.')) {
      // 直接是扩展名，如 .jpg, .png
      const ext = type.substring(1).toLowerCase()
      if (ext) extensions.push(ext)
    } else if (type.includes('/')) {
      // MIME类型，如 image/*, video/mp4
      const [category, subtype] = type.split('/')
      
      if (category === 'image') {
        extensions.push('jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg')
      } else if (category === 'video') {
        extensions.push('mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv')
      } else if (category === 'audio') {
        extensions.push('mp3', 'wav', 'ogg', 'flac', 'aac')
      } else if (type === 'application/pdf') {
        extensions.push('pdf')
      } else if (type === 'text/plain') {
        extensions.push('txt')
      }
    }
  }
  
  // 去重并返回
  return [...new Set(extensions)]
}

// 创建 Context
const UploadContext = createContext<UploadContextValue | null>(null)

// Hook 用于访问上传状态
export const useUpload = () => {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成文件预览
const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      // 视频预览可以生成缩略图，这里简化处理
      resolve('')
    } else {
      resolve('')
    }
  })
}

// 文件类型图标
const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.startsWith('video/')) return '🎬'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.includes('document') || fileType.includes('word')) return '📝'
  if (fileType.includes('archive') || fileType.includes('zip')) return '📦'
  return '📄'
}

// 上传组件主体
const Upload: React.FC<UploadProps> = ({
  accept,
  maxSize = 10,
  multiple = false,
  disabled = false,
  onFileSelect,
  onUpload,
  onError,
  uploadText = '拖拽文件到此处或点击选择',
  buttonText = '选择文件',
  className = '',
  dragActiveClassName = '',
  showFileList = true,
  maxFiles,
  renderPreview,
  autoUpload = false,
  beforeUpload,
  customUpload,
  children
}) => {
  const [state, setState] = useState<UploadState>({
    files: [],
    isDragging: false,
    isUploading: false
  })

  // 添加文件
  const addFiles = useCallback(async (newFiles: File[]) => {
    const validFiles: File[] = []
    
    for (const file of newFiles) {
      // 检查文件大小
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        onError?.(`文件 ${file.name} 超过大小限制 ${maxSize}MB`)
        continue
      }

      // 检查文件类型
      if (accept && !file.type.match(accept)) {
        onError?.(`文件 ${file.name} 类型不支持`)
        continue
      }

      // 检查文件数量限制
      if (maxFiles && state.files.length >= maxFiles) {
        onError?.(`最多只能上传 ${maxFiles} 个文件`)
        break
      }

      // 检查 beforeUpload
      if (beforeUpload) {
        try {
          const result = await beforeUpload(file)
          if (!result) continue
        } catch (error) {
          onError?.(`文件 ${file.name} 验证失败`)
          continue
        }
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    const uploadFiles: UploadFile[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: await generateFilePreview(file),
        status: 'pending' as const,
        progress: 0,
        error: undefined
      }))
    )

    setState(prev => ({
      ...prev,
      files: multiple ? [...prev.files, ...uploadFiles] : uploadFiles
    }))

    onFileSelect?.(validFiles)

    // 自动上传
    if (autoUpload) {
      uploadFiles.forEach(file => uploadFile(file.id))
    }
  }, [state.files.length, maxSize, accept, maxFiles, multiple, onFileSelect, onError, beforeUpload, autoUpload])

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== id)
    }))
  }, [])

  // 清空文件
  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: []
    }))
  }, [])

  // 上传单个文件
  const uploadFile = useCallback(async (id: string) => {
    const file = state.files.find(f => f.id === id)
    if (!file) return

    setState(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ),
      isUploading: true
    }))

    try {
      if (customUpload) {
        await customUpload(file.file)
      } else if (onUpload) {
        await onUpload(file.file)
      } else {
        // 模拟上传
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setState(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === id ? { ...f, progress: i } : f
            )
          }))
        }
      }

      setState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === id ? { ...f, status: 'success' as const, progress: 100 } : f
        )
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === id 
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : '上传失败' }
            : f
        )
      }))
      onError?.(`文件 ${file.name} 上传失败`)
    }
  }, [state.files, onUpload, customUpload, onError])

  // 上传所有文件
  const uploadAll = useCallback(async () => {
    const pendingFiles = state.files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    for (const file of pendingFiles) {
      await uploadFile(file.id)
    }
  }, [state.files, uploadFile])

  // 重试上传
  const retryUpload = useCallback(async (id: string) => {
    const file = state.files.find(f => f.id === id)
    if (!file) return

    setState(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === id 
          ? { ...f, status: 'pending' as const, progress: 0, error: undefined }
          : f
      )
    }))

    await uploadFile(id)
  }, [state.files, uploadFile])

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setState(prev => ({ ...prev, isDragging: true }))
    }
  }, [disabled])

  const handleDragLeave = useCallback(() => {
    setState(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragging: false }))
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      addFiles(files)
    }
  }, [disabled, addFiles])

  const triggerFileInput = useCallback(async () => {
    if (disabled) return

    try {
      // 使用主进程的原生文件对话框
      const filePaths = await window.electronAPI.openFileDialog({
        title: '选择文件',
        filters: accept ? [
          { name: '支持的文件', extensions: getExtensionsFromAccept(accept) }
        ] : undefined,
        properties: multiple ? ['openFile', 'multiSelections'] : ['openFile']
      })

      if (filePaths && filePaths.length > 0) {
        // 将文件路径转换为File对象
        const files = await convertFilePathsToFiles(filePaths)
        addFiles(files)
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
      onError?.('打开文件选择对话框失败')
    }
  }, [disabled, accept, multiple, addFiles, onError])

  // 渲染文件项
  const renderFileItem = (file: UploadFile) => {
    const icon = getFileIcon(file.type)
    const statusIcon = file.status === 'success' ? '✅' : 
                      file.status === 'error' ? '❌' : 
                      file.status === 'uploading' ? '⏳' : '⏳'

    return (
      <div key={file.id} className={`upload-file-item ${file.status}`}>
        <div className="file-info">
          <div className="file-icon">{icon}</div>
          <div className="file-details">
            <div className="file-name">{file.name}</div>
            <div className="file-meta">
              <span>{formatFileSize(file.size)}</span>
              {file.status === 'uploading' && (
                <span className="upload-progress">{file.progress}%</span>
              )}
            </div>
          </div>
          <div className="file-actions">
            <span className="file-status">{statusIcon}</span>
            {file.status === 'error' && (
              <button 
                className="retry-btn"
                onClick={() => retryUpload(file.id)}
                title="重试"
              >
                🔄
              </button>
            )}
            <button 
              className="remove-btn"
              onClick={() => removeFile(file.id)}
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
        
        {file.status === 'uploading' && (
          <div className="upload-progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
        )}
        
        {file.error && (
          <div className="file-error">{file.error}</div>
        )}
      </div>
    )
  }

  const contextValue: UploadContextValue = {
    state,
    addFiles,
    removeFile,
    clearFiles,
    uploadFile,
    uploadAll,
    retryUpload
  }

  return (
    <UploadContext.Provider value={contextValue}>
      <div className={`upload-container ${className} ${disabled ? 'disabled' : ''}`}>
        {/* 主上传区域 */}
        <div
          className={`upload-dropzone ${state.isDragging ? dragActiveClassName || 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="upload-content">
            {children || (
              <>
                <div className="upload-icon">📁</div>
                <div className="upload-text">{uploadText}</div>
                <button className="upload-button" disabled={disabled}>
                  {buttonText}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 文件列表 */}
        {showFileList && state.files.length > 0 && (
          <div className="upload-file-list">
            {state.files.map(renderFileItem)}
            
            {state.files.some(f => f.status === 'pending') && (
              <div className="upload-actions">
                <button 
                  className="upload-all-btn"
                  onClick={uploadAll}
                  disabled={state.isUploading}
                >
                  🚀 上传所有文件
                </button>
                <button 
                  className="clear-btn"
                  onClick={clearFiles}
                >
                  🗑️ 清空列表
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </UploadContext.Provider>
  )
}

export default Upload