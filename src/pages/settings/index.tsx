// Settings 页面路由入口
export { default } from './page'

// 页面元数据
export const pageMeta = {
  path: '/settings',
  icon: '⚙️',
  permissions: ['admin'], // 需要管理员权限
  showInMenu: true, // 在菜单中显示
  canOpenWindow: true // 支持单独窗口
}
