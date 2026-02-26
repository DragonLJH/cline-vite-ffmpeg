import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 导入类型定义
import { Language, LanguageInfo } from '../types/stores'

// 语言列表
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  {
    code: 'zh-HK',
    name: 'Traditional Chinese (HK)',
    nativeName: '繁體中文（香港）',
    flag: '🇭🇰'
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸'
  }
]

// 获取默认语言（基于浏览器语言）
const getDefaultLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh-CN'

  const browserLang = navigator.language || (navigator as any).userLanguage
  console.log('🌐 浏览器语言:', browserLang)

  // 检查浏览器语言是否支持
  if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-SG')) {
    return 'zh-CN'
  } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-MO')) {
    return 'zh-HK'
  } else if (browserLang.startsWith('en')) {
    return 'en-US'
  }

  // 默认返回简体中文
  return 'zh-CN'
}

// 检测系统语言
export const detectLanguage = (): Language => {
  return getDefaultLanguage()
}

// 翻译函数类型
export type TranslateFunction = (key: string, params?: Record<string, any>) => string

interface I18nState {
  currentLanguage: Language
  translations: Record<string, any>
  isLoading: boolean
  error: string | null

  // Actions
  setLanguage: (language: Language) => Promise<void>
  loadTranslations: (language: Language) => Promise<void>
  t: TranslateFunction
  getLanguageInfo: (code: Language) => LanguageInfo | undefined
  getLanguageName: (code: Language) => string
}

// 简单的翻译函数实现
const createTranslateFunction = (translations: Record<string, any>): TranslateFunction => {
  return (key: string, params?: Record<string, any>): string => {
    // 使用点号分隔的路径查找翻译
    const keys = key.split('.')
    let current = translations

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        console.warn(`⚠️ 翻译键不存在: ${key}`)
        return key // 返回原始键作为回退
      }
    }

    let result = typeof current === 'string' ? current : key

    // 处理参数替换
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
      })
    }

    return result
  }
}

// 检查是否为Electron环境
const isElectron = typeof window !== 'undefined' && window.electronAPI

// 广播语言更改到其他窗口
const broadcastLanguageChange = (language: Language) => {
  if (isElectron) {
    try {
      window.electronAPI.broadcastLanguageChange(language)
      console.log('📡 已广播语言更改:', language)
    } catch (error) {
      console.error('❌ 广播语言更改失败:', error)
    }
  }
}

// 监听来自其他窗口的语言更改广播
const setupLanguageBroadcastListener = () => {
  if (isElectron) {
    window.electronAPI.on('language:changed', (event: any, newLanguage: Language) => {
      console.log('📥 收到语言更改广播:', newLanguage)
      const currentLanguage = useI18nStore.getState().currentLanguage
      if (currentLanguage !== newLanguage) {
        useI18nStore.setState({ currentLanguage: newLanguage })
        useI18nStore.getState().loadTranslations(newLanguage)
      }
    })
  }
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      currentLanguage: getDefaultLanguage(),
      translations: {},
      isLoading: false,
      error: null,

      setLanguage: async (language: Language) => {
        set({ isLoading: true, error: null })

        try {
          // 加载翻译
          await get().loadTranslations(language)

          // 更新状态
          set({
            currentLanguage: language,
            isLoading: false,
            error: null
          })


          // 广播语言更改
          broadcastLanguageChange(language)

          console.log(`✅ 语言切换成功: ${language}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '语言切换失败'
          set({
            isLoading: false,
            error: errorMessage
          })
          console.error('❌ 语言切换失败:', error)
        }
      },

      loadTranslations: async (language: Language) => {
        try {
          console.log(`🌍 加载翻译文件: ${language}`)

          // 动态导入翻译文件
          const translationModule = await import(`../locales/${language}.json`)

          set({
            translations: translationModule.default || {},
            error: null
          })

          console.log(`✅ 翻译文件加载成功: ${language}`)
        } catch (error) {
          console.error(`❌ 翻译文件加载失败: ${language}`, error)
          set({
            error: `翻译文件加载失败: ${language}`
          })
          throw error
        }
      },

      t: (key: string, params?: Record<string, any>) => {
        const { translations } = get()
        const translate = createTranslateFunction(translations)
        return translate(key, params)
      },

      getLanguageInfo: (code: Language) => {
        return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
      },

      getLanguageName: (code: Language) => {
        const lang = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
        return lang ? `${lang.flag} ${lang.nativeName}` : code
      }
    }),
    {
      name: 'i18n-storage',
      // 只持久化当前语言，不持久化翻译内容（避免占用过多存储）
      partialize: (state) => ({
        currentLanguage: state.currentLanguage
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 初始化时加载当前语言的翻译
          const store = useI18nStore.getState()
          store.loadTranslations(state.currentLanguage).catch(console.error)
        }
        // 设置监听器
        setupLanguageBroadcastListener()
      }
    }
  )
)

// 初始化语言和监听器
if (typeof window !== 'undefined') {
  const store = useI18nStore.getState()
  const defaultLang = getDefaultLanguage()

  // 如果存储的语言与默认语言不同，使用存储的语言
  if (store.currentLanguage !== defaultLang) {
    store.loadTranslations(store.currentLanguage).catch(console.error)
  } else {
    // 否则使用默认语言
    store.loadTranslations(defaultLang).catch(console.error)
  }

  setupLanguageBroadcastListener()
}