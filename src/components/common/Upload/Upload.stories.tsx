import type { Meta, StoryObj } from '@storybook/react'
import Upload from './Upload'

const meta: Meta<typeof Upload> = {
  title: 'Components/Common/Upload',
  component: Upload,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '标签文本'
    },
    accept: {
      control: 'text',
      description: '允许的文件类型，如 image/*, .pdf,.doc'
    },
    multiple: {
      control: 'boolean',
      description: '是否支持多选'
    },
    maxSize: {
      control: 'number',
      description: '最大文件大小（字节）'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    },
    showPreview: {
      control: 'boolean',
      description: '是否显示预览'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// 基础用法
export const Default: Story = {
  args: {
    label: '上传文件',
    onChange: (files) => console.log('Selected files:', files),
    onError: (message) => console.error('Upload error:', message)
  }
}

// 仅图片上传
export const ImageOnly: Story = {
  args: {
    label: '上传图片',
    accept: 'image/*',
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 多文件上传
export const Multiple: Story = {
  args: {
    label: '上传多个文件',
    multiple: true,
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 限制文件大小
export const WithMaxSize: Story = {
  args: {
    label: '上传文件（最大 5MB）',
    maxSize: 5 * 1024 * 1024, // 5MB
    onChange: (files) => console.log('Selected files:', files),
    onError: (message) => alert(message)
  }
}

// 禁用状态
export const Disabled: Story = {
  args: {
    label: '禁用上传',
    disabled: true
  }
}

// 不显示预览
export const NoPreview: Story = {
  args: {
    label: '上传文件（不显示预览）',
    showPreview: false,
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 仅文档上传
export const DocumentOnly: Story = {
  args: {
    label: '上传文档',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 仅音频上传
export const AudioOnly: Story = {
  args: {
    label: '上传音频',
    accept: 'audio/*',
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 仅视频上传
export const VideoOnly: Story = {
  args: {
    label: '上传视频',
    accept: 'video/*',
    onChange: (files) => console.log('Selected files:', files)
  }
}

// 完整功能示例
export const FullFeatured: Story = {
  args: {
    label: '上传文件（完整功能）',
    accept: 'image/*,audio/*,video/*,.pdf,.doc,.docx',
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    showPreview: true,
    onChange: (files) => console.log('Selected files:', files),
    onError: (message) => console.error('Upload error:', message)
  }
}