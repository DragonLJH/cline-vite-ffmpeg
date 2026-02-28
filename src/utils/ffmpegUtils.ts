/**
 * FFmpeg 工具函数
 * 用于处理音频和视频文件的预览生成
 */

export interface FFmpegResult {
    success: boolean
    data?: string // base64 图片数据
    error?: string
}

/**
 * 检查音频文件是否有封面图片
 */
export async function checkAudioHasCover(filePath: string): Promise<boolean> {
    try {
        if (!window.electronAPI) {
            console.warn('Electron API not available')
            return false
        }

        const result = await window.electronAPI?.ffmpeg?.checkAudioMetadata(filePath)
        return result?.hasCover || false
    } catch (error) {
        console.error('检查音频元数据失败:', error)
        return false
    }
}

/**
 * 提取音频文件的封面图片
 */
export async function extractAudioCover(filePath: string): Promise<FFmpegResult> {
    try {
        if (!window.electronAPI) {
            return {
                success: false,
                error: 'Electron API not available'
            }
        }

        const result = await window.electronAPI?.ffmpeg?.extractAudioCover(filePath)
        if (result) {
            return {
                success: true,
                data: result
            }
        }

        return {
            success: false,
            error: 'No cover found'
        }
    } catch (error) {
        console.error('提取音频封面失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Extract cover failed'
        }
    }
}

/**
 * 提取视频文件的第一帧作为缩略图
 */
export async function extractVideoThumbnail(filePath: string): Promise<FFmpegResult> {
    try {
        if (!window.electronAPI) {
            return {
                success: false,
                error: 'Electron API not available'
            }
        }

        const result = await window.electronAPI?.ffmpeg?.extractVideoThumbnail(filePath)
        if (result) {
            return {
                success: true,
                data: result
            }
        }

        return {
            success: false,
            error: 'Failed to extract thumbnail'
        }
    } catch (error) {
        console.error('提取视频缩略图失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Extract thumbnail failed'
        }
    }
}

/**
 * 生成文件的SVG图标
 */
export function generateFileSVGIcon(fileType: string): string {
    const width = 200
    const height = 200
    const centerX = width / 2
    const centerY = height / 2
    const radius = 60

    let color = '#666'
    let text = '📄'
    let label = 'File'

    // 根据文件类型设置颜色和标签
    if (fileType.startsWith('image/')) {
        color = '#3b82f6'
        text = '🖼️'
        label = 'Image'
    } else if (fileType.startsWith('video/')) {
        color = '#10b981'
        text = '🎬'
        label = 'Video'
    } else if (fileType.startsWith('audio/')) {
        color = '#f59e0b'
        text = '🎵'
        label = 'Audio'
    } else if (fileType === 'application/pdf') {
        color = '#ef4444'
        text = '📄'
        label = 'PDF'
    } else if (fileType.includes('document') || fileType.includes('word')) {
        color = '#22c55e'
        text = '📝'
        label = 'Document'
    } else if (fileType.includes('archive') || fileType.includes('zip')) {
        color = '#8b5cf6'
        text = '📦'
        label = 'Archive'
    } else if (fileType.includes('text')) {
        color = '#64748b'
        text = '📝'
        label = 'Text'
    }

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- 主要图标 -->
      <circle cx="${centerX}" cy="${centerY - 20}" r="${radius}" fill="${color}" opacity="0.1"/>
      <circle cx="${centerX}" cy="${centerY - 20}" r="${radius - 10}" fill="${color}" opacity="0.2"/>
      <circle cx="${centerX}" cy="${centerY - 20}" r="${radius - 20}" fill="${color}" opacity="0.3"/>
      
      <!-- 文件图标 -->
      <rect x="${centerX - 30}" y="${centerY - 40}" width="60" height="80" rx="8" fill="white" stroke="#e2e8f0" stroke-width="2"/>
      <path d="M${centerX + 18} ${centerY - 40} L${centerX + 18} ${centerY + 40}" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- 文件类型图标 -->
      <text x="${centerX}" y="${centerY - 20}" text-anchor="middle" font-size="48" font-family="Arial, sans-serif">${text}</text>
      
      <!-- 标签 -->
      <text x="${centerX}" y="${centerY + 40}" text-anchor="middle" font-size="14" fill="#64748b" font-family="Arial, sans-serif">${label}</text>
      
      <!-- 装饰线条 -->
      <line x1="${centerX - 40}" y1="${centerY + 60}" x2="${centerX + 40}" y2="${centerY + 60}" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `

    return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 生成默认的音频SVG图标
 */
export function generateAudioSVGIcon(): string {
    const width = 200
    const height = 200

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" opacity="0.3"/>
      
      <!-- 音频波形 -->
      <g transform="translate(${width / 2}, ${height / 2})">
        <rect x="-60" y="-20" width="4" height="40" fill="#f59e0b" opacity="0.6">
          <animate attributeName="height" values="10;40;10" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-5;-20;-5" dur="1s" repeatCount="indefinite"/>
        </rect>
        <rect x="-45" y="-30" width="4" height="60" fill="#f59e0b" opacity="0.8">
          <animate attributeName="height" values="20;60;20" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-15;-30;-15" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="-30" y="-15" width="4" height="30" fill="#f59e0b" opacity="0.6">
          <animate attributeName="height" values="5;30;5" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-2.5;-15;-2.5" dur="0.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="-15" y="-25" width="4" height="50" fill="#f59e0b" opacity="0.9">
          <animate attributeName="height" values="15;50;15" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-12.5;-25;-12.5" dur="1.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="0" y="-10" width="4" height="20" fill="#f59e0b" opacity="0.5">
          <animate attributeName="height" values="0;20;0" dur="0.5s" repeatCount="indefinite"/>
          <animate attributeName="y" values="0;-10;0" dur="0.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="15" y="-20" width="4" height="40" fill="#f59e0b" opacity="0.7">
          <animate attributeName="height" values="10;40;10" dur="1.1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-5;-20;-5" dur="1.1s" repeatCount="indefinite"/>
        </rect>
        <rect x="30" y="-15" width="4" height="30" fill="#f59e0b" opacity="0.6">
          <animate attributeName="height" values="5;30;5" dur="0.9s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-2.5;-15;-2.5" dur="0.9s" repeatCount="indefinite"/>
        </rect>
        <rect x="45" y="-25" width="4" height="50" fill="#f59e0b" opacity="0.8">
          <animate attributeName="height" values="15;50;15" dur="1.3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="-12.5;-25;-12.5" dur="1.3s" repeatCount="indefinite"/>
        </rect>
        <rect x="60" y="-5" width="4" height="10" fill="#f59e0b" opacity="0.4">
          <animate attributeName="height" values="0;10;0" dur="0.7s" repeatCount="indefinite"/>
          <animate attributeName="y" values="0;-5;0" dur="0.7s" repeatCount="indefinite"/>
        </rect>
      </g>
      
      <!-- 标签 -->
      <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-size="14" fill="#f59e0b" font-family="Arial, sans-serif">Audio File</text>
    </svg>
  `

    return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 生成默认的视频SVG图标
 */
export function generateVideoSVGIcon(): string {
    const width = 200
    const height = 200

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#ecfdf5" stroke="#10b981" stroke-width="2" opacity="0.3"/>
      
      <!-- 播放按钮 -->
      <circle cx="${width / 2}" cy="${height / 2}" r="50" fill="#10b981" opacity="0.2"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="40" fill="#10b981" opacity="0.3"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="30" fill="#10b981" opacity="0.4"/>
      
      <!-- 播放图标 -->
      <polygon points="${width / 2 - 15},${height / 2 - 20} ${width / 2 - 15},${height / 2 + 20} ${width / 2 + 15},${height / 2}" fill="white" stroke="#10b981" stroke-width="2"/>
      
      <!-- 时间轴 -->
      <rect x="${width / 2 - 40}" y="${height / 2 + 40}" width="80" height="4" rx="2" fill="#10b981" opacity="0.5"/>
      <circle cx="${width / 2 - 20}" cy="${height / 2 + 42}" r="4" fill="#10b981" opacity="0.8">
        <animate attributeName="cx" from="${width / 2 - 40}" to="${width / 2 + 40}" dur="3s" repeatCount="indefinite"/>
      </circle>
      
      <!-- 标签 -->
      <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-size="14" fill="#10b981" font-family="Arial, sans-serif">Video File</text>
    </svg>
  `

    return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 生成文件预览
 */
export async function generateFilePreview(file: File): Promise<{
    preview: string
    previewType: 'image' | 'svg' | 'video-thumbnail'
    hasMetadata?: boolean
}> {
    // 图片文件直接生成预览
    if (file.type.startsWith('image/')) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                resolve({
                    preview: e.target?.result as string,
                    previewType: 'image'
                })
            }
            reader.readAsDataURL(file)
        })
    }

    // 音频文件处理
    if (file.type.startsWith('audio/')) {
        // 检查是否有封面
        const hasCover = await checkAudioHasCover(file.path || '')

        if (hasCover) {
            const coverResult = await extractAudioCover(file.path || '')
            if (coverResult.success && coverResult.data) {
                return {
                    preview: coverResult.data,
                    previewType: 'image',
                    hasMetadata: true
                }
            }
        }

        // 没有封面或提取失败，使用SVG图标
        return {
            preview: generateAudioSVGIcon(),
            previewType: 'svg'
        }
    }

    // 视频文件处理
    if (file.type.startsWith('video/')) {
        const thumbnailResult = await extractVideoThumbnail(file.path || '')
        if (thumbnailResult.success && thumbnailResult.data) {
            return {
                preview: thumbnailResult.data,
                previewType: 'video-thumbnail',
                hasMetadata: true
            }
        }

        // 提取失败，使用SVG图标
        return {
            preview: generateVideoSVGIcon(),
            previewType: 'svg'
        }
    }

    // 其他文件类型使用SVG图标
    return {
        preview: generateFileSVGIcon(file.type),
        previewType: 'svg'
    }
}