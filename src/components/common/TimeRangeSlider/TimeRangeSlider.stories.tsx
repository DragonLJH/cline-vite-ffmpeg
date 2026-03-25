import type { Meta, StoryObj } from '@storybook/react'
import TimeRangeSlider from './TimeRangeSlider'

const meta: Meta<typeof TimeRangeSlider> = {
  title: 'Components/TimeRangeSlider',
  component: TimeRangeSlider,
  parameters: {
    docs: {
      description: {
        component: '时间范围选择器组件，用于选择视频的开始和结束时间，支持拖拽和输入框调整'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number', min: 0, max: 3600, step: 1 },
      description: '视频总时长（秒）'
    },
    startTime: {
      control: { type: 'number', min: 0, max: 3600, step: 0.1 },
      description: '开始时间（秒）'
    },
    endTime: {
      control: { type: 'number', min: 0, max: 3600, step: 0.1 },
      description: '结束时间（秒）'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// 基础示例
export const Default: Story = {
  args: {
    duration: 60,
    startTime: 0,
    endTime: 60,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: false
  }
}

// 带视频时长的状态
export const WithVideo: Story = {
  args: {
    duration: 120,
    startTime: 10,
    endTime: 50,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: false
  }
}

// 禁用状态
export const Disabled: Story = {
  args: {
    duration: 60,
    startTime: 0,
    endTime: 60,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: true
  }
}

// 自定义时间范围
export const CustomRange: Story = {
  args: {
    duration: 180,
    startTime: 30,
    endTime: 120,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: false
  }
}

// 短视频状态
export const ShortVideo: Story = {
  args: {
    duration: 15,
    startTime: 0,
    endTime: 15,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: false
  }
}

// 长视频状态
export const LongVideo: Story = {
  args: {
    duration: 600,
    startTime: 0,
    endTime: 600,
    onStartTimeChange: () => {},
    onEndTimeChange: () => {},
    disabled: false
  }
}

// 组合示例
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">默认状态</h3>
        <TimeRangeSlider
          duration={60}
          startTime={0}
          endTime={60}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">带视频时长</h3>
        <TimeRangeSlider
          duration={120}
          startTime={10}
          endTime={50}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">禁用状态</h3>
        <TimeRangeSlider
          duration={60}
          startTime={0}
          endTime={60}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          disabled={true}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">短视频</h3>
        <TimeRangeSlider
          duration={15}
          startTime={0}
          endTime={15}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          disabled={false}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">长视频</h3>
        <TimeRangeSlider
          duration={600}
          startTime={0}
          endTime={600}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          disabled={false}
        />
      </div>
    </div>
  )
}