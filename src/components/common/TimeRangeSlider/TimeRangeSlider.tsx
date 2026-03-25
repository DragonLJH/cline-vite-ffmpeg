import React, { useState, useRef, useEffect } from 'react'

export interface TimeRangeSliderProps {
  /** 视频总时长（秒） */
  duration: number
  /** 开始时间（秒） */
  startTime: number
  /** 结束时间（秒） */
  endTime: number
  /** 开始时间变化回调 */
  onStartTimeChange: (time: number) => void
  /** 结束时间变化回调 */
  onEndTimeChange: (time: number) => void
  /** 是否禁用 */
  disabled?: boolean
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算百分比位置
  const getPercent = (time: number): number => {
    return duration > 0 ? (time / duration) * 100 : 0
  }

  // 从鼠标位置计算时间
  const getTimeFromPosition = (clientX: number): number => {
    if (!sliderRef.current) return 0
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return percent * duration
  }

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled) return
      
      const time = getTimeFromPosition(e.clientX)
      
      if (isDragging === 'start') {
        const newStartTime = Math.max(0, Math.min(time, endTime - 0.1))
        onStartTimeChange(newStartTime)
      } else {
        const newEndTime = Math.max(startTime + 0.1, Math.min(time, duration))
        onEndTimeChange(newEndTime)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, startTime, endTime, duration, disabled, onStartTimeChange, onEndTimeChange])

  // 处理滑块点击
  const handleSliderClick = (e: React.MouseEvent) => {
    if (disabled) return
    
    const time = getTimeFromPosition(e.clientX)
    
    // 判断点击位置更靠近哪个滑块
    const startDistance = Math.abs(time - startTime)
    const endDistance = Math.abs(time - endTime)
    
    if (startDistance < endDistance) {
      onStartTimeChange(Math.min(time, endTime - 0.1))
    } else {
      onEndTimeChange(Math.max(time, startTime + 0.1))
    }
  }

  return (
    <div className="w-full">
      {/* 时间显示 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[var(--text-secondary)]">
          ⏰ 时间范围
        </span>
        <span className="text-sm text-[var(--text-primary)] font-medium">
          {formatTime(startTime)} - {formatTime(endTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* 时间轴滑块 */}
      <div
        ref={sliderRef}
        className="relative h-8 bg-[var(--bg-secondary)] rounded-lg cursor-pointer"
        onClick={handleSliderClick}
      >
        {/* 背景轨道 */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* 选中区域 */}
          <div
            className="absolute h-full bg-[var(--primary)] opacity-30"
            style={{
              left: `${getPercent(startTime)}%`,
              width: `${getPercent(endTime - startTime)}%`
            }}
          />
        </div>

        {/* 开始时间滑块 */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--primary)] rounded-full cursor-grab active:cursor-grabbing shadow-lg border-2 border-white transition-transform hover:scale-110 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ left: `calc(${getPercent(startTime)}% - 8px)` }}
          onMouseDown={() => !disabled && setIsDragging('start')}
        />

        {/* 结束时间滑块 */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--primary)] rounded-full cursor-grab active:cursor-grabbing shadow-lg border-2 border-white transition-transform hover:scale-110 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ left: `calc(${getPercent(endTime)}% - 8px)` }}
          onMouseDown={() => !disabled && setIsDragging('end')}
        />

        {/* 时间刻度 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {duration > 0 ? (
            Array.from({ length: 5 }, (_, i) => {
              const time = (duration / 4) * i
              return (
                <span
                  key={i}
                  className="text-xs text-[var(--text-secondary)]"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  {formatTime(time)}
                </span>
              )
            })
          ) : (
            <span className="text-xs text-[var(--text-secondary)] mx-auto">
              请先上传视频
            </span>
          )}
        </div>
      </div>

      {/* 时间输入框 */}
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            开始时间
          </label>
          <input
            type="number"
            min="0"
            max={endTime - 0.1}
            step="0.1"
            value={startTime.toFixed(1)}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              if (!isNaN(time) && time >= 0 && time < endTime) {
                onStartTimeChange(time)
              }
            }}
            disabled={disabled}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            结束时间
          </label>
          <input
            type="number"
            min={startTime + 0.1}
            max={duration}
            step="0.1"
            value={endTime.toFixed(1)}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              if (!isNaN(time) && time > startTime && time <= duration) {
                onEndTimeChange(time)
              }
            }}
            disabled={disabled}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
          />
        </div>
      </div>

      {/* 快捷按钮 */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            onStartTimeChange(0)
            onEndTimeChange(duration)
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-card)] disabled:opacity-50"
        >
          全程
        </button>
        <button
          type="button"
          onClick={() => {
            onStartTimeChange(0)
            onEndTimeChange(Math.min(5, duration))
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-card)] disabled:opacity-50"
        >
          前5秒
        </button>
        <button
          type="button"
          onClick={() => {
            onStartTimeChange(Math.max(0, duration - 5))
            onEndTimeChange(duration)
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-card)] disabled:opacity-50"
        >
          后5秒
        </button>
      </div>
    </div>
  )
}

export default TimeRangeSlider