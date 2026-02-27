import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as apiLogin, logout as apiLogout } from '@/services/auth'
import { LoginRequest, LoginResponse, User, UserState } from '@/types'

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      login: (user: User) => set({
        currentUser: user,
        isLoggedIn: true,
        error: null
      }),

      logout: () => set({
        currentUser: null,
        isLoggedIn: false,
        error: null
      }),

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().currentUser
        if (currentUser) {
          set({
            currentUser: { ...currentUser, ...updates }
          })
        }
      },

      // 异步登录方法
      loginAsync: async (credentials: LoginRequest): Promise<LoginResponse> => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiLogin(credentials)

          if (response.success && response.data?.user) {
            set({
              currentUser: response.data.user,
              isLoggedIn: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              isLoading: false,
              error: response.message || '登录失败'
            })
          }

          return response
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '网络请求失败'
          set({
            isLoading: false,
            error: errorMessage
          })
          return {
            success: false,
            message: errorMessage
          }
        }
      },

      // 异步登出方法
      logoutAsync: async (): Promise<void> => {
        set({ isLoading: true, error: null })

        try {
          await apiLogout()
          set({
            currentUser: null,
            isLoggedIn: false,
            isLoading: false,
            error: null
          })
        } catch (error) {
          // 即使API调用失败，也要本地登出
          set({
            currentUser: null,
            isLoggedIn: false,
            isLoading: false,
            error: error instanceof Error ? error.message : '登出失败'
          })
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      hasRole: (role: string) => {
        const currentUser = get().currentUser
        return currentUser?.roles?.includes(role) || false
      },

      hasPermission: (permission: string) => {
        const currentUser = get().currentUser
        return currentUser?.permissions?.includes(permission) || false
      }
    }),
    {
      name: 'user-storage',
      // 只持久化用户信息，不持久化登录状态、加载状态和错误信息
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
)
