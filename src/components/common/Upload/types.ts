import React from 'react'

export interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export interface UploadProps {
  /** 支持的文件类型，如 'image/*', 'video/*', '.pdf' 等 */
  accept?: string
  
  /** 最大文件大小限制（MB） */
  maxSize?: number
  
  /** 是否支持多文件上传 */
  multiple?: boolean
  
  /** 是否禁用上传 */
  disabled?: boolean
  
  /** 文件选择回调 */
  onFileSelect?: (files: File[]) => void
  
  /** 文件上传回调 */
  onUpload?: (file: File) => Promise<void>
  
  /** 上传错误回调 */
  onError?: (error: string) => void
  
  /** 上传区域文本 */
  uploadText?: string
  
  /** 选择文件按钮文本 */
  buttonText?: string
  
  /** 自定义样式类名 */
  className?: string
  
  /** 拖拽激活时的样式类名 */
  dragActiveClassName?: string
  
  /** 是否显示文件列表 */
  showFileList?: boolean
  
  /** 最大文件数量限制 */
  maxFiles?: number
  
  /** 自定义文件预览组件 */
  renderPreview?: (file: UploadFile) => React.ReactNode
  
  /** 是否自动上传 */
  autoUpload?: boolean
  
  /** 文件上传前的验证函数 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  
  /** 自定义上传处理函数 */
  customUpload?: (file: File) => Promise<void>
  
  /** 自定义上传区域内容 */
  children?: React.ReactNode
}

export interface UploadState {
  files: UploadFile[]
  isDragging: boolean
  isUploading: boolean
}

export interface UploadContextValue {
  state: UploadState
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  uploadFile: (id: string) => Promise<void>
  uploadAll: () => Promise<void>
  retryUpload: (id: string) => Promise<void>
}