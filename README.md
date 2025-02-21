# DronePilotWeb - 无人机场景编程平台

## 项目简介
DronePilotWeb 是一个现代化的无人机场景编程平台，为用户提供直观的Web界面来创建、编辑和管理无人机飞行场景。通过该平台，用户可以轻松地设计无人机飞行路径、编写控制逻辑，并进行场景管理。

🚀 [立即体验](https://dronepilot.ocetars.top/) | 📖 [查看文档](https://dpw-docs.ocetars.top/)

## ✨ 核心功能
- 🎮 **三维场景模拟**：使用 Three.js 构建真实的 3D 场景，支持无人机模型加载、场景控制和视角调整
- 💻 **可视化编程**：集成 Monaco Editor，支持 JavaScript 代码编写，实时控制无人机行为
- 📸 **图像处理能力**：集成 OpenCV.js，支持实时图像处理和目标检测，实现复杂的视觉控制逻辑
- 💾 **场景管理**：支持保存和加载自定义场景，包括地面纹理、尺寸和无人机位置
- 🔐 **用户认证**：集成 Clerk 用户认证系统，确保数据安全
- 📊 **实时反馈**：提供实时的无人机状态和摄像头画面反馈，支持代码调试

## 🚀 技术栈
- 前端框架：Vue 3
- UI组件库：Element Plus
- 状态管理：Pinia
- 代码编辑器：Monaco Editor
- 3D渲染：Three.js
- 构建工具：Vite
- 用户认证：Clerk

## 🔧 本地开发
1. 克隆项目
```bash
git clone [项目地址]
cd DronePilotWeb
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件并配置必要的环境变量：
```
VITE_API_BASE_URL=你的API地址
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 📦 部署
项目使用Vite构建，可以轻松部署到任何静态网站托管服务：
1. 执行构建命令：`npm run build`
2. 将 `dist` 目录部署到你的服务器

## 🤝 贡献指南
欢迎提交Issue和Pull Request来帮助改进项目。请确保：
- 遵循现有的代码风格
- 添加必要的测试和文档
- 提交前进行本地测试

## 📄 许可证
本项目基于 MIT 许可发布

## 🔗 相关链接
- [项目文档](https://dpw-docs.ocetars.top/)
- [在线演示](https://dronepilot.ocetars.top/)
- [问题反馈](https://github.com/Ocetars/DronePilotWeb/issues)