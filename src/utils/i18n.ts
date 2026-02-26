import { Language, SUPPORTED_LANGUAGES } from '../stores/i18nStore'

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param language 语言代码
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | number, language: Language = 'zh-CN', options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }

  const formatOptions = { ...defaultOptions, ...options }
  
  try {
    return new Intl.DateTimeFormat(language, formatOptions).format(date)
  } catch (error) {
    console.warn('日期格式化失败，使用默认格式:', error)
    return new Date(date).toLocaleString()
  }
}

/**
 * 格式化数字
 * @param number 数字
 * @param language 语言代码
 * @param options 格式化选项
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (number: number, language: Language = 'zh-CN', options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2
  }

  const formatOptions = { ...defaultOptions, ...options }
  
  try {
    return new Intl.NumberFormat(language, formatOptions).format(number)
  } catch (error) {
    console.warn('数字格式化失败，使用默认格式:', error)
    return String(number)
  }
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币代码
 * @param language 语言代码
 * @param options 格式化选项
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (amount: number, currency: string = 'CNY', language: Language = 'zh-CN', options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }

  const formatOptions = { ...defaultOptions, ...options }
  
  try {
    return new Intl.NumberFormat(language, formatOptions).format(amount)
  } catch (error) {
    console.warn('货币格式化失败，使用默认格式:', error)
    return `${currency} ${amount}`
  }
}

/**
 * 获取语言显示名称
 * @param code 语言代码
 * @returns 语言显示名称
 */
export const getLanguageDisplayName = (code: Language): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
  return lang ? `${lang.flag} ${lang.nativeName} (${lang.name})` : code
}

/**
 * 获取当前语言的显示名称
 * @returns 当前语言显示名称
 */
export const getCurrentLanguageDisplayName = (): string => {
  if (typeof window === 'undefined') return 'zh-CN'
  
  try {
    // 直接访问全局store实例
    const { useI18nStore } = require('../stores/i18nStore')
    const currentLanguage = useI18nStore.getState().currentLanguage
    return getLanguageDisplayName(currentLanguage)
  } catch (error) {
    console.warn('获取当前语言失败:', error)
    return 'zh-CN'
  }
}

/**
 * 检查语言是否支持
 * @param code 语言代码
 * @returns 是否支持
 */
export const isLanguageSupported = (code: string): code is Language => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code)
}

/**
 * 获取浏览器首选语言
 * @returns 浏览器首选语言
 */
export const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh-CN'
  
  const browserLang = navigator.language || (navigator as any).userLanguage
  
  if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-SG')) {
    return 'zh-CN'
  } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-MO')) {
    return 'zh-HK'
  } else if (browserLang.startsWith('en')) {
    return 'en-US'
  }
  
  return 'zh-CN'
}

/**
 * 翻译键路径解析器
 * @param key 翻译键
 * @param translations 翻译对象
 * @returns 翻译值
 */
export const resolveTranslationKey = (key: string, translations: Record<string, any>): any => {
  const keys = key.split('.')
  let current = translations
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return null
    }
  }
  
  return current
}

/**
 * 安全的翻译函数（带回退机制）
 * @param key 翻译键
 * @param translations 翻译对象
 * @param params 参数
 * @param fallback 回退值
 * @returns 翻译结果
 */
export const safeTranslate = (
  key: string, 
  translations: Record<string, any>, 
  params?: Record<string, any>, 
  fallback?: string
): string => {
  const value = resolveTranslationKey(key, translations)
  
  if (typeof value !== 'string') {
    console.warn(`⚠️ 翻译键不存在或不是字符串: ${key}`)
    return fallback || key
  }
  
  let result = value
  
  // 处理参数替换
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
    })
  }
  
  return result
}

/**
 * 语言变更事件处理器
 * @param callback 回调函数
 * @returns 清理函数
 */
export const onLanguageChange = (callback: (language: Language) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }
  
  const handleLanguageChange = (event: any, newLanguage: Language) => {
    callback(newLanguage)
  }
  
  if (window.electronAPI?.on) {
    window.electronAPI.on('language:changed', handleLanguageChange)
  }
  
  return () => {
    if (window.electronAPI?.off) {
      window.electronAPI.off('language:changed', handleLanguageChange)
    }
  }
}

/**
 * 广播语言变更事件
 * @param language 新语言
 */
export const broadcastLanguageChange = (language: Language): void => {
  if (typeof window === 'undefined') return
  
  if (window.electronAPI?.broadcastLanguageChange) {
    try {
      window.electronAPI.broadcastLanguageChange(language)
      console.log('📡 广播语言变更:', language)
    } catch (error) {
      console.error('❌ 广播语言变更失败:', error)
    }
  }
}

/**
 * 语言工具类
 */
export class LanguageUtils {
  /**
   * 获取语言信息
   */
  static getLanguageInfo(code: Language) {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
  }

  /**
   * 获取所有支持的语言
   */
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES
  }

  /**
   * 检查是否为有效语言
   */
  static isValidLanguage(code: string): code is Language {
    return isLanguageSupported(code)
  }

  /**
   * 获取默认语言
   */
  static getDefaultLanguage(): Language {
    return getBrowserLanguage()
  }

  /**
   * 格式化相对时间
   */
  static formatRelativeTime(date: Date | number, language: Language = 'zh-CN'): string {
    try {
      const relativeTime = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
      const now = Date.now()
      const diffInSeconds = Math.floor((date.valueOf() - now) / 1000)
      
      if (Math.abs(diffInSeconds) < 60) {
        return relativeTime.format(diffInSeconds, 'second')
      } else if (Math.abs(diffInSeconds) < 3600) {
        return relativeTime.format(Math.floor(diffInSeconds / 60), 'minute')
      } else if (Math.abs(diffInSeconds) < 86400) {
        return relativeTime.format(Math.floor(diffInSeconds / 3600), 'hour')
      } else if (Math.abs(diffInSeconds) < 2592000) {
        return relativeTime.format(Math.floor(diffInSeconds / 86400), 'day')
      } else if (Math.abs(diffInSeconds) < 31536000) {
        return relativeTime.format(Math.floor(diffInSeconds / 2592000), 'month')
      } else {
        return relativeTime.format(Math.floor(diffInSeconds / 31536000), 'year')
      }
    } catch (error) {
      console.warn('相对时间格式化失败:', error)
      return new Date(date).toLocaleString(language)
    }
  }

  /**
   * 检测系统语言
   */
  static detectLanguage(): Language {
    return getBrowserLanguage()
  }
}

/**
 * 检测系统语言（独立函数）
 */
export const detectLanguage = (): Language => {
  return getBrowserLanguage()
}