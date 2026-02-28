import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: '通用输入框组件，支持标签、错误提示和帮助文本'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number'],
      description: '输入框类型'
    },
    placeholder: {
      control: 'text',
      description: '占位符文本'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// 基础输入框
export const Default: Story = {
  args: {
    placeholder: '请输入内容'
  }
}

export const WithLabel: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名'
  }
}

export const WithError: Story = {
  args: {
    label: '邮箱地址',
    type: 'email',
    placeholder: '请输入邮箱地址',
    error: '请输入有效的邮箱地址'
  }
}

export const WithHelperText: Story = {
  args: {
    label: '密码',
    type: 'password',
    placeholder: '请输入密码',
    helperText: '密码至少需要8个字符'
  }
}

// 不同类型
export const Email: Story = {
  args: {
    type: 'email',
    label: '邮箱',
    placeholder: 'user@example.com'
  }
}

export const Password: Story = {
  args: {
    type: 'password',
    label: '密码',
    placeholder: '请输入密码'
  }
}

export const Number: Story = {
  args: {
    type: 'number',
    label: '年龄',
    placeholder: '请输入年龄'
  }
}

// 禁用状态
export const Disabled: Story = {
  args: {
    disabled: true,
    label: '禁用输入框',
    placeholder: '这个输入框被禁用了'
  }
}

// 组合示例
export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input
        label="用户名"
        placeholder="请输入用户名"
        helperText="用户名将用于登录"
      />
      <Input
        label="邮箱地址"
        type="email"
        placeholder="user@example.com"
        helperText="我们将通过此邮箱联系您"
      />
      <Input
        label="密码"
        type="password"
        placeholder="请输入密码"
        error="密码强度不够"
      />
    </div>
  )
}
