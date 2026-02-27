import type { Preview } from '@storybook/react'
import '../src/styles/index.scss'

// 模拟 Electron API
const mockElectronAPI = {
  platform: 'win32',
  appInfo: {
    isDev: true
  },
  minimizeWindow: () => console.log('minimizeWindow'),
  toggleMaximize: () => console.log('toggleMaximize'),
  closeWindow: () => console.log('closeWindow'),
  openWindow: (path: string, title: string) => {
    console.log('openWindow:', { path, title })
    return Promise.resolve({ success: true })
  },
  on: (event: string, callback: Function) => {
    console.log('addEventListener:', event)
  },
  off: (event: string, callback: Function) => {
    console.log('removeEventListener:', event)
  }
}

// 在全局作用域设置模拟
if (typeof window !== 'undefined') {
  ;(window as any).electronAPI = mockElectronAPI
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    docs: {
      toc: true
    }
  }
}

export default preview