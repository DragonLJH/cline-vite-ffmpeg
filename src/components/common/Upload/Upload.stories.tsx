import type { Meta, StoryObj } from '@storybook/react'
import Upload from './Upload'
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof Upload> = {
  title: 'Components/Upload',
  component: Upload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: 'text',
      description: '支持的文件类型'
    },
    maxSize: {
      control: { type: 'number', min: 1, max: 1000 },
      description: '最大文件大小限制（MB）'
    },
    multiple: {
      control: 'boolean',
      description: '是否支持多文件上传'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用上传'
    },
    uploadText: {
      control: 'text',
      description: '上传区域文本'
    },
    buttonText: {
      control: 'text',
      description: '选择文件按钮文本'
    },
    showFileList: {
      control: 'boolean',
      description: '是否显示文件列表'
    },
    maxFiles: {
      control: { type: 'number', min: 1, max: 100 },
      description: '最大文件数量限制'
    },
    autoUpload: {
      control: 'boolean',
      description: '是否自动上传'
    }
  },
  args: {
    onFileSelect: (files) => action('文件选择')(files),
    onUpload: (file) => new Promise(resolve => {
      action('文件上传')(file)
      resolve()
    }),
    onError: (error) => action('上传错误')(error),
    uploadText: '拖拽文件到此处或点击选择',
    buttonText: '选择文件',
    maxSize: 10,
    multiple: true,
    showFileList: true,
    autoUpload: false
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    accept: 'image/*,video/*',
  }
}

export const SingleFile: Story = {
  args: {
    accept: 'image/*',
    multiple: false,
    uploadText: '拖拽图片到此处',
    buttonText: '选择图片'
  }
}

export const VideoUpload: Story = {
  args: {
    accept: 'video/*',
    uploadText: '拖拽视频文件到此处',
    buttonText: '选择视频'
  }
}

export const PDFUpload: Story = {
  args: {
    accept: '.pdf,application/pdf',
    uploadText: '拖拽PDF文件到此处',
    buttonText: '选择PDF'
  }
}

export const LimitedSize: Story = {
  args: {
    accept: 'image/*',
    maxSize: 2,
    uploadText: '最大2MB的图片文件',
    buttonText: '选择小图片'
  }
}

export const LimitedFiles: Story = {
  args: {
    accept: 'image/*',
    maxFiles: 3,
    uploadText: '最多选择3张图片',
    buttonText: '选择图片'
  }
}

export const AutoUpload: Story = {
  args: {
    accept: 'image/*',
    autoUpload: true,
    uploadText: '选择图片后自动上传',
    buttonText: '选择图片'
  }
}

export const CustomContent: Story = {
  args: {
    accept: 'image/*',
    uploadText: '自定义上传区域',
    buttonText: '选择文件',
    children: (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        border: '2px dashed #ccc',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          照片上传
        </div>
        <div style={{ color: '#666', marginBottom: '24px' }}>
          拖拽照片到此处或点击下方按钮
        </div>
        <button style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          选择照片
        </button>
      </div>
    )
  }
}

export const Disabled: Story = {
  args: {
    accept: 'image/*',
    disabled: true,
    uploadText: '上传功能已禁用',
    buttonText: '选择文件'
  }
}
