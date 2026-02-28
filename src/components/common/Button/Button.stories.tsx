import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: '通用按钮组件，支持多种变体和尺寸'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: '按钮变体'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '按钮尺寸'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// 基础按钮
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '主要按钮'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '次要按钮'
  }
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: '危险按钮'
  }
}

// 不同尺寸
export const Small: Story = {
  args: {
    size: 'sm',
    children: '小按钮'
  }
}

export const Medium: Story = {
  args: {
    size: 'md',
    children: '中按钮'
  }
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: '大按钮'
  }
}

// 禁用状态
export const Disabled: Story = {
  args: {
    disabled: true,
    children: '禁用按钮'
  }
}

// 组合示例
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">主要</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="danger">危险</Button>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button size="sm">小尺寸</Button>
      <Button size="md">中等尺寸</Button>
      <Button size="lg">大尺寸</Button>
    </div>
  )
}
