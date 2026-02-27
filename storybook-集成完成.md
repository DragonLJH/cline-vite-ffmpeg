# Storybook 集成完成

## 概述

✅ Storybook 已成功集成到 cline-vite 项目中！

## 当前状态

- ✅ Storybook 服务器已在 `http://localhost:6006/` 运行
- ✅ 所有组件 Stories 已创建
- ✅ 配置文件已正确设置
- ✅ 路径别名和样式导入已配置

## 访问地址

- **本地访问**: http://localhost:6006/
- **网络访问**: http://10.0.237.203:6006/

## 已创建的组件 Stories

### 1. Button 组件
- 位置: `src/components/common/Button/Button.stories.tsx`
- 包含多种变体和尺寸:
  - 主要按钮 (Primary)
  - 次要按钮 (Secondary)
  - 危险按钮 (Danger)
  - 小/中/大尺寸
  - 禁用状态
  - 组合示例

### 2. Input 组件
- 位置: `src/components/common/Input/Input.stories.tsx`
- 包含多种输入框类型:
  - 基础输入框
  - 带标签的输入框
  - 带错误提示的输入框
  - 带帮助文本的输入框
  - 不同类型 (email, password, number)
  - 禁用状态
  - 表单示例

## 配置文件

### `.storybook/main.ts`
- 配置了 Storybook 的主要设置
- 设置了 Vite 构建配置
- 配置了路径别名 (`@` 指向 `src`)
- 配置了 SCSS 样式导入

### `.storybook/preview.ts`
- 全局样式导入
- Electron API 模拟
- 全局参数配置

### `package.json` 脚本
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 使用方法

### 启动 Storybook
```bash
yarn storybook
# 或
npx storybook dev -p 6006
```

### 构建 Storybook
```bash
yarn build-storybook
# 或
npx storybook build
```
