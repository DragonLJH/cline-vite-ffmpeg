你是一个资深全栈工程师，请帮我实现一个基于 Electron + Node.js + React 的 FFmpeg 工具模块。

技术栈要求：
- Electron（主进程 + 渲染进程）
- Node.js（调用 FFmpeg）
- React + TypeScript（前端 UI）
- TailwindCSS（样式）
- Storybook（组件开发与展示）

编码规范：
- 使用 TypeScript + ES6
- 模块化设计（按功能拆分）
- 所有方法必须有类型定义
- 使用 async/await 处理异步
- 提供错误处理机制

架构要求：
1. FFmpeg 逻辑必须在 Electron 主进程或 Node 层执行
2. 前端通过 IPC 与主进程通信
3. 封装统一的 FFmpegService
4. UI 与逻辑完全解耦

需要实现功能：
{填写功能，例如：视频转码、截图、裁剪}

输出要求：
1. 提供完整代码（主进程 + 渲染进程 + service）
2. 提供 IPC 通信示例
3. 提供 React UI 示例（使用 Tailwind）
4. 提供一个 Storybook 组件示例
5. 提供目录结构设计