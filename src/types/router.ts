// 路由相关类型定义

// 页面元数据接口
export interface PageMeta {
  title: string
}

// 页面模块接口
export interface PageModule {
  default: React.ComponentType
}

// 动态路由配置接口
export interface RouteConfig {
  key: string
  path: string
  component: () => Promise<PageModule>
  meta: PageMeta
}

// 支持的语言类型
export type Language = 'zh-CN' | 'zh-HK' | 'en-US'