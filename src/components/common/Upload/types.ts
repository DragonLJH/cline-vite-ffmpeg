import React from 'react'

// 上传组件 Props 接口
export interface UploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onError'> {
  /** 标签文本 */
  label?: string
  /** 允许的文件类型，如 'image/*', '.pdf,.doc' */
  accept?: string
  /** 是否支持多选 */
  multiple?: boolean
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 受控值 */
  value?: File | File[] | null
  /** 文件变化回调 */
  onChange?: (files: File | File[] | null) => void
  /** 错误回调 */
  onError?: (message: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示预览（图片/音频/视频） */
  showPreview?: boolean
  /** 自定义类名 */
  className?: string
  
  // 以下属性为了兼容旧 API
  /** 上传提示文本（兼容旧 API） */
  uploadText?: string
  /** 选择按钮文本（兼容旧 API） */
  buttonText?: string
  /** 是否显示文件列表（兼容旧 API） */
  showFileList?: boolean
  /** 文件选择回调（兼容旧 API） */
  onFileSelect?: (files: File[]) => void
}

// 文件项信息
export interface FileItem {
  /** 文件对象 */
  file: File
  /** 预览 URL */
  previewUrl?: string
  /** 文件类型分类 */
  category: FileCategory
}

// 文件类型分类
export type FileCategory = 'image' | 'audio' | 'video' | 'document' | 'archive' | 'other'

// 文件类型映射配置
export interface FileTypeConfig {
  category: FileCategory
  icon: string
  color: string
}