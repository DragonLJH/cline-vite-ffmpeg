import React, { useState } from 'react'

interface TextWatermarkEditorProps {
  initialText?: string
  initialFontSize?: number
  initialFontColor?: string
  initialOpacity?: number
  initialBackgroundColor?: string
  initialBorderWidth?: number
  initialBorderColor?: string
  initialShadow?: boolean
  initialFontFamily?: string
  onChange: (config: {
    text: string
    fontSize: number
    fontColor: string
    opacity: number
    backgroundColor?: string
    borderWidth?: number
    borderColor?: string
    shadow: boolean
    fontFamily?: string
  }) => void
}

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#4B0082'
]

const FONT_FAMILIES = [
  { value: '', label: '默认字体' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'SimHei', label: '黑体 (SimHei)' },
  { value: 'SimSun', label: '宋体 (SimSun)' },
  { value: 'Microsoft YaHei', label: '微软雅黑 (Microsoft YaHei)' },
  { value: 'KaiTi', label: '楷体 (KaiTi)' }
]

const TextWatermarkEditor: React.FC<TextWatermarkEditorProps> = ({
  initialText = '',
  initialFontSize = 24,
  initialFontColor = '#FFFFFF',
  initialOpacity = 100,
  initialBackgroundColor = '',
  initialBorderWidth = 0,
  initialBorderColor = '#000000',
  initialShadow = false,
  initialFontFamily = '',
  onChange
}) => {
  const [text, setText] = useState(initialText)
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [fontColor, setFontColor] = useState(initialFontColor)
  const [opacity, setOpacity] = useState(initialOpacity)
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor)
  const [borderWidth, setBorderWidth] = useState(initialBorderWidth)
  const [borderColor, setBorderColor] = useState(initialBorderColor)
  const [shadow, setShadow] = useState(initialShadow)
  const [fontFamily, setFontFamily] = useState(initialFontFamily)

  const handleChange = (updates: Partial<typeof text>) => {
    const newConfig = {
      text,
      fontSize,
      fontColor,
      opacity,
      backgroundColor,
      borderWidth,
      borderColor,
      shadow,
      fontFamily,
      ...updates
    }
    onChange(newConfig)
  }

  return (
    <div className="space-y-4">
      {/* 文字内容 */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          文字内容
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            handleChange({ text: e.target.value })
          }}
          placeholder="输入水印文字..."
          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
        />
      </div>

      {/* 字体选择 */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          字体
        </label>
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value)
            handleChange({ fontFamily: e.target.value })
          }}
          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* 字体大小和透明度 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            字体大小
          </label>
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => {
              const value = Number(e.target.value)
              setFontSize(value)
              handleChange({ fontSize: value })
            }}
            className="w-full"
          />
          <span className="text-sm text-[var(--text-secondary)]">{fontSize}px</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            透明度
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => {
              const value = Number(e.target.value)
              setOpacity(value)
              handleChange({ opacity: value })
            }}
            className="w-full"
          />
          <span className="text-sm text-[var(--text-secondary)]">{opacity}%</span>
        </div>
      </div>

      {/* 字体颜色 */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          字体颜色
        </label>
        <div className="flex items-center gap-3 mb-3">
          {/* 原生颜色选择器 */}
          <div className="relative">
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value)
                handleChange({ fontColor: e.target.value })
              }}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[var(--border-primary)]"
              title="点击选择颜色"
            />
          </div>
          {/* 颜色值输入 */}
          <input
            type="text"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value)
              handleChange({ fontColor: e.target.value })
            }}
            placeholder="#FFFFFF"
            className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)] font-mono"
          />
        </div>
        {/* 预设颜色 */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => {
                setFontColor(color)
                handleChange({ fontColor: color })
              }}
              className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                fontColor.toUpperCase() === color.toUpperCase()
                  ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-50'
                  : 'border-transparent hover:border-[var(--border-primary)]'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 背景颜色 */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          背景颜色 (可选)
        </label>
        <div className="flex items-center gap-3 mb-3">
          {/* 无背景选项 */}
          <button
            onClick={() => {
              setBackgroundColor('')
              handleChange({ backgroundColor: '' })
            }}
            className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
              !backgroundColor
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-400 hover:border-gray-500'
            }`}
            title="无背景"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* 原生颜色选择器 */}
          <div className="relative">
            <input
              type="color"
              value={backgroundColor || '#000000'}
              onChange={(e) => {
                setBackgroundColor(e.target.value)
                handleChange({ backgroundColor: e.target.value })
              }}
              disabled={!backgroundColor}
              className={`w-12 h-12 rounded-lg cursor-pointer border-2 border-[var(--border-primary)] ${
                !backgroundColor ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={backgroundColor ? "点击选择颜色" : "先点击左侧按钮启用背景"}
            />
          </div>
          {/* 颜色值输入 */}
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value)
              handleChange({ backgroundColor: e.target.value })
            }}
            placeholder="无背景"
            disabled={!backgroundColor}
            className={`flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)] font-mono ${
              !backgroundColor ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
        {/* 预设颜色 */}
        {backgroundColor && (
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => {
                  setBackgroundColor(color)
                  handleChange({ backgroundColor: color })
                }}
                className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                  backgroundColor.toUpperCase() === color.toUpperCase()
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-50'
                    : 'border-transparent hover:border-[var(--border-primary)]'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* 边框设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            边框宽度
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={borderWidth}
            onChange={(e) => {
              const value = Number(e.target.value)
              setBorderWidth(value)
              handleChange({ borderWidth: value })
            }}
            className="w-full"
          />
          <span className="text-sm text-[var(--text-secondary)]">{borderWidth}px</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            边框颜色
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => {
                setBorderColor(e.target.value)
                handleChange({ borderColor: e.target.value })
              }}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[var(--border-primary)]"
            />
            <input
              type="text"
              value={borderColor}
              onChange={(e) => {
                setBorderColor(e.target.value)
                handleChange({ borderColor: e.target.value })
              }}
              placeholder="#000000"
              className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)] font-mono"
            />
          </div>
        </div>
      </div>

      {/* 阴影选项 */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="shadow"
          checked={shadow}
          onChange={(e) => {
            setShadow(e.target.checked)
            handleChange({ shadow: e.target.checked })
          }}
          className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary)] focus:ring-[var(--primary)]"
        />
        <label htmlFor="shadow" className="text-sm font-medium text-[var(--text-primary)]">
          添加阴影效果
        </label>
      </div>

      {/* 实时预览 */}
      <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          预览
        </label>
        <div className="flex items-center justify-center h-24 bg-gray-800 rounded-lg overflow-hidden">
          <span
            style={{
              fontSize: `${Math.min(fontSize, 48)}px`,
              color: fontColor,
              opacity: opacity / 100,
              fontFamily: fontFamily || 'inherit',
              backgroundColor: backgroundColor || 'transparent',
              padding: backgroundColor ? '4px 8px' : '0',
              borderRadius: '4px',
              border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
              textShadow: shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            {text || '示例文字'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TextWatermarkEditor