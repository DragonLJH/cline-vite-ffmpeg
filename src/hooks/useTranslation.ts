import { useCallback } from 'react'
import { useI18nStore, SUPPORTED_LANGUAGES } from '@/stores/i18nStore'
import { Language } from '@/types'
import { detectLanguage } from '@/utils/i18n'

/**
 * 翻译Hook
 * @returns 翻译函数和相关状态
 */
export const useTranslation = () => {
  const { t, currentLanguage, setLanguage, isLoading, error } = useI18nStore()

  /**
   * 切换语言
   * @param language 目标语言
   */
  const changeLanguage = useCallback(async (language: Language) => {
    try {
      await setLanguage(language)
      console.log(`✅ 语言已切换到: ${language}`)
    } catch (error) {
      console.error('❌ 语言切换失败:', error)
    }
  }, [setLanguage])

  /**
   * 获取当前语言信息
   */
  const getCurrentLanguageInfo = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)
  }, [currentLanguage])

  /**
   * 检查语言是否为当前语言
   */
  const isCurrentLanguage = useCallback((language: Language) => {
    return currentLanguage === language
  }, [currentLanguage])

  /**
   * 获取语言列表
   */
  const getLanguageOptions = useCallback(() => {
    return SUPPORTED_LANGUAGES.map(lang => ({
      ...lang,
      isCurrent: lang.code === currentLanguage
    }))
  }, [currentLanguage])

  return {
    // 翻译函数
    t,

    // 当前语言
    currentLanguage,

    // 语言切换
    changeLanguage,

    // 语言信息
    getCurrentLanguageInfo,
    isCurrentLanguage,
    getLanguageOptions,

    // 状态
    isLoading,
    error
  }
}

/**
 * 语言选择Hook（专门用于语言选择器）
 */
export const useLanguageSelector = () => {
  const { changeLanguage, currentLanguage, getLanguageOptions, isCurrentLanguage } = useTranslation()

  /**
   * 快速切换到下一种语言
   */
  const toggleLanguage = useCallback(() => {
    const options = getLanguageOptions()
    const currentIndex = options.findIndex(opt => opt.isCurrent)
    const nextIndex = (currentIndex + 1) % options.length
    const nextLanguage = options[nextIndex].code

    return changeLanguage(nextLanguage)
  }, [getLanguageOptions, changeLanguage])

  /**
   * 获取快速切换按钮文本
   */
  const getQuickToggleText = useCallback(() => {
    const options = getLanguageOptions()
    const currentIndex = options.findIndex(opt => opt.isCurrent)
    const nextIndex = (currentIndex + 1) % options.length
    const nextLanguage = options[nextIndex].code

    const toggleTexts: Record<Language, string> = {
      'zh-CN': '🌐 快速切换到繁体中文',
      'zh-HK': '🌐 快速切换到英文',
      'en-US': '🌐 快速切换到简体中文'
    }

    return toggleTexts[nextLanguage]
  }, [getLanguageOptions])

  /**
   * 自动检测并切换语言
   */
  const autoDetectLanguage = useCallback(async () => {
    const detectedLanguage = detectLanguage()
    if (currentLanguage !== detectedLanguage) {
      await changeLanguage(detectedLanguage)
    }
  }, [currentLanguage, changeLanguage])

  return {
    changeLanguage,
    currentLanguage,
    getLanguageOptions,
    isCurrentLanguage,
    toggleLanguage,
    getQuickToggleText,
    autoDetectLanguage
  }
}

/**
 * 格式化翻译函数（带参数）
 */
export const useFormattedTranslation = () => {
  const { t } = useTranslation()

  /**
   * 格式化翻译
   * @param key 翻译键
   * @param params 参数对象
   * @returns 格式化后的翻译
   */
  const ft = useCallback((key: string, params: Record<string, any> = {}) => {
    return t(key, params)
  }, [t])

  return { ft }
}