<p align="center">
  <img src="https://forgeturl.com/favicon.svg" alt="ForgetURL Logo" width="100" height="100">
</p>

<h1 align="center">🎨 ForgetURL 前端</h1>

<p align="center">
  <strong>极简书签管理前端 - 基于 Vue 3 构建</strong>
</p>

<p align="center">
  <a href="https://github.com/forgeturl/forgeturl-website-claude-opus-4.5/releases">
    <img src="https://img.shields.io/github/v/release/forgeturl/forgeturl-website-claude-opus-4.5" alt="Release">
  </a>
  <a href="https://github.com/forgeturl/forgeturl-website-claude-opus-4.5/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/forgeturl/forgeturl-website-claude-opus-4.5" alt="License">
  </a>
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js" alt="Vue Version">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite" alt="Vite">
  <a href="https://github.com/forgeturl/forgeturl-website-claude-opus-4.5/stargazers">
    <img src="https://img.shields.io/github/stars/forgeturl/forgeturl-website-claude-opus-4.5?style=social" alt="Stars">
  </a>
</p>

<p align="center">
  <a href="https://forgeturl.com" target="_blank">
    <img src="https://img.shields.io/badge/🌐_在线体验-ForgetURL.com-blue?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-许可证">许可证</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | 中文
</p>

---

## 📖 简介

ForgetURL Website 是 [ForgetURL](https://forgeturl.com) 的前端应用 - 一个极简主义的书签管理平台。基于 Vue 3 和现代 Web 技术构建，提供简洁优雅的界面来整理和分享你的网络书签。

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔐 **OAuth 登录** | 支持 Google、GitHub 登录 |
| 📖 **书签页面** | 创建、编辑、删除书签页面 |
| 🔗 **灵活分享** | 只读、可编辑、管理员分享链接 |
| 📱 **响应式设计** | 完美适配桌面和移动端 |
| 🎨 **极简 UI** | 类 X.com / ChatGPT 的简约设计 |
| 💾 **状态持久化** | 登录状态本地保存 |
| 🌍 **多环境** | 自动切换 本地/测试/生产 环境 |

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| **框架** | Vue 3 (Composition API) |
| **构建工具** | Vite |
| **状态管理** | Pinia |
| **路由** | Vue Router 4 |
| **样式** | Tailwind CSS |
| **UI 组件** | Headless UI |
| **HTTP 客户端** | Axios |

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/forgeturl/forgeturl-website-claude-opus-4.5.git
cd forgeturl-website-claude-opus-4.5

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
# 构建
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
src/
├── api/                    # API 层
│   ├── auth.js             # 认证接口
│   └── space.js            # 空间和页面接口
├── assets/                 # 静态资源
│   └── main.css            # 全局样式
├── components/             # UI 组件
│   ├── AddLinkModal.vue    # 添加链接弹窗
│   ├── CreatePageModal.vue # 创建页面弹窗
│   ├── EditPageModal.vue   # 编辑页面弹窗
│   ├── LinkCollection.vue  # 链接集合组件
│   ├── LinkItem.vue        # 链接项组件
│   ├── PageCard.vue        # 页面卡片组件
│   └── ShareModal.vue      # 分享弹窗
├── composables/            # 组合式函数
│   ├── useAuth.js          # 认证逻辑
│   ├── useAutoSave.js      # 自动保存逻辑
│   └── useTheme.js         # 主题逻辑
├── router/                 # 路由配置
│   └── index.js            # 路由定义
├── stores/                 # 状态管理
│   ├── auth.js             # 认证状态
│   └── page.js             # 页面状态
├── utils/                  # 工具函数
│   ├── config.js           # 环境配置
│   ├── request.js          # HTTP 请求封装
│   └── storage.js          # 本地存储工具
├── views/                  # 页面视图
│   ├── AuthCallback.vue    # OAuth 回调
│   ├── Home.vue            # 首页（我的空间）
│   ├── Login.vue           # 登录页
│   ├── MySpace.vue         # 我的空间页
│   ├── PageDetail.vue      # 页面详情
│   └── SharePage.vue       # 分享页面视图
├── App.vue                 # 根组件
└── main.js                 # 应用入口
```

## 🔑 核心功能

### 认证流程

```
用户点击登录
    ↓
GET /login/connector/auth → 获取 OAuth URL
    ↓
跳转到 OAuth 提供商 (Google/GitHub)
    ↓
用户授权
    ↓
回调到 /auth/callback/:provider
    ↓
GET /login/connector/callback/:provider
    ↓
获取 X-Token + 用户信息
    ↓
保存到 localStorage → 跳转到首页
```

### 权限分享

| 分享类型 | 前缀 | 权限 |
|----------|------|------|
| 只读 | `R` | 仅查看 |
| 可编辑 | `E` | 查看和编辑 |
| 管理员 | `A` | 完全控制 |

## 🌐 环境配置

应用根据域名自动切换 API 端点：

| 环境 | 域名 | API 端点 |
|------|------|----------|
| 本地 | `localhost` | `http://127.0.0.1:80` |
| 测试 | `test.forgeturl.com` | `https://test-api.brightguo.com` |
| 生产 | `forgeturl.com` | `https://api.brightguo.com` |

## 🎨 设计理念

- **极简主义** - 类 X.com / ChatGPT 的简洁界面
- **黑白灰** - 单色调配蓝色点缀
- **大量留白** - 专注内容，减少干扰
- **圆角设计** - 柔和友好的外观
- **流畅动画** - 平滑的过渡效果

## 🔧 开发指南

### 代码规范

- 使用 Vue 3 Composition API
- 遵循 Vue 官方风格指南
- 使用 ES6+ 语法
- 组件名使用 PascalCase

### 添加新路由

```javascript
// src/router/index.js
{
  path: '/your-path',
  name: 'YourPage',
  component: () => import('@/views/YourPage.vue'),
  meta: { 
    requiresAuth: true,
    title: '页面标题'
  }
}
```

### 添加新接口

```javascript
// src/api/your-api.js
import request from '@/utils/request'

export function yourApi(params) {
  return request({
    url: '/your/endpoint',
    method: 'POST',
    data: params
  })
}
```

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献

欢迎贡献！

- 🐛 [报告 Bug](https://github.com/forgeturl/.github/issues/new?template=bug_report_zh.md)
- 💡 [功能建议](https://github.com/forgeturl/.github/issues/new?template=feature_request_zh.md)
- 📝 改进文档
- 🔧 提交 Pull Request

## 🔗 相关项目

- [ForgetURL Server](https://github.com/forgeturl/forgeturl-server) - 后端 API 服务

---

<p align="center">
  <a href="https://forgeturl.com">
    <img src="https://img.shields.io/badge/体验_ForgetURL-→_forgeturl.com-2ea44f?style=flat-square" alt="Try ForgetURL">
  </a>
</p>

<p align="center">
  Made with ❤️ by ForgetURL Team
</p>
