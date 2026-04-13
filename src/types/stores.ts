// Store 相关类型定义
import { Language, ThemeType } from './common'
import { LoginRequest, LoginResponse } from './api'

// 语言信息接口
export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
}

// 翻译函数类型
export type TranslateFunction = (key: string, params?: Record<string, any>) => string

// I18n 状态接口
export interface I18nState {
  currentLanguage: Language
  languages: LanguageInfo[]
  t: TranslateFunction
  setLanguage: (language: Language) => void
  getLanguageInfo: (code: Language) => LanguageInfo | undefined
  getAvailableLanguages: () => LanguageInfo[]
}

// 主题状态接口
export interface ThemeState {
  theme: ThemeType
  toggleTheme: () => void
  setTheme: (theme: ThemeType) => void
  isDark: boolean
}

// 用户接口
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt?: string
  roles?: string[]
  permissions?: string[]
}

// 用户状态接口
export interface UserState {
  currentUser: User | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
  login: (user: User) => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  loginAsync: (credentials: LoginRequest) => Promise<LoginResponse>
  logoutAsync: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

// 计数器状态接口
export interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  incrementBy: (amount: number) => void
  decrementBy: (amount: number) => void
  setCount: (count: number) => void
}
