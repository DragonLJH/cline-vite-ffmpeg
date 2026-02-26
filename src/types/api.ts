// API 相关类型定义

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应接口
export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      username: string
      email: string
    }
  }
  message?: string
}

// 通用 API 响应接口
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
