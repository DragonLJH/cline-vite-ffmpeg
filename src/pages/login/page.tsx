import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { LoginRequest } from '../../types'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginAsync, isLoading, error, isLoggedIn } = useUserStore()

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  })

  // 如果已经登录，重定向到首页
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.password.trim()) {
      return
    }

    try {
      const response = await loginAsync(formData)

      if (response.success && response.data?.user) {
        console.log('🎉 登录成功，同步状态并关闭窗口')

        // 广播登录成功事件给所有窗口
        if (window.electronAPI?.broadcastLoginSuccess) {
          const res = await window.electronAPI.broadcastLoginSuccess(response.data.user)
          console.log('📡 已广播登录成功事件', res)
          res &&
            window.electronAPI.closeWindow()
        }
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error)
    }
  }

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setFormData({
        username: 'admin',
        password: 'admin123'
      })
    } else {
      setFormData({
        username: 'user',
        password: 'user123'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)] bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            🔐 登录
          </h1>
          <p className="text-[var(--text-secondary)]">
            请输入您的账号信息进行登录
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                用户名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-200"
                placeholder="请输入用户名"
                disabled={isLoading}
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-200"
                placeholder="请输入密码"
                disabled={isLoading}
              />
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading || !formData.username.trim() || !formData.password.trim()}
              className="w-full bg-[var(--gradient-primary)] text-[var(--text-inverse)] py-3 px-6 rounded-xl font-semibold text-lg shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[var(--shadow-md)]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 演示账号 */}
          <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
            <p className="text-sm text-[var(--text-secondary)] mb-4 text-center">
              演示账号（点击填充）:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fillDemoCredentials('admin')}
                className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
                disabled={isLoading}
              >
                👤 管理员
              </button>
              <button
                onClick={() => fillDemoCredentials('user')}
                className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
                disabled={isLoading}
              >
                👨‍💻 普通用户
              </button>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-6">
          <p className="text-[var(--text-muted)] text-sm">
            模拟登录接口 - 仅用于演示目的
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
