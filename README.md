# ForgetURL - 极简书签管理网站

基于 Vue 3 + Vite + Pinia + Tailwind CSS 构建的极简风格书签管理网站。

## ✨ 功能特性

- 🔐 **第三方登录** - 支持 Google、GitHub 登录
- 📖 **书签管理** - 创建、编辑、删除书签页面
- 🔗 **权限分享** - 支持只读、编辑、超级权限链接分享
- 🌍 **多环境支持** - 自动切换 local、test、onl 环境
- 💾 **状态持久化** - 登录状态和用户信息本地保存
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🎨 **极简风格** - 类似 X.com/ChatGPT 的简约设计

## 🛠 技术栈

- **Vue 3** - 渐进式 JavaScript 框架（Composition API）
- **Vite** - 新一代前端构建工具
- **Pinia** - Vue 官方状态管理库
- **Vue Router 4** - 官方路由管理器
- **Tailwind CSS** - 原子化 CSS 框架
- **Headless UI** - 无样式可访问组件库
- **Axios** - HTTP 客户端

## 📦 安装

```bash
# 安装依赖
npm install
```

## 🚀 开发

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 🏗 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
src/
├── api/                # API 接口封装
│   ├── auth.js         # 认证相关接口
│   └── space.js        # 空间和页面接口
├── assets/             # 静态资源
│   └── main.css        # 全局样式
├── components/         # 公共组件
│   ├── CreatePageModal.vue   # 创建页面模态框
│   ├── LinkCollection.vue    # 链接集合组件
│   ├── LinkItem.vue          # 链接项组件
│   ├── PageCard.vue          # 页面卡片组件
│   └── ShareModal.vue        # 分享模态框
├── composables/        # 组合式函数
│   └── useAuth.js      # 认证相关逻辑
├── router/             # 路由配置
│   └── index.js        # 主路由
├── stores/             # 状态管理
│   ├── auth.js         # 认证状态
│   └── page.js         # 页面状态
├── utils/              # 工具函数
│   ├── config.js       # 环境配置
│   ├── request.js      # HTTP 请求封装
│   └── storage.js      # 本地存储
├── views/              # 页面视图
│   ├── AuthCallback.vue  # 登录回调页
│   ├── Home.vue          # 首页（我的空间）
│   ├── Login.vue         # 登录页
│   ├── PageDetail.vue    # 页面详情
│   └── SharePage.vue     # 分享页面
├── App.vue             # 根组件
└── main.js             # 应用入口
```

## 🔑 核心功能说明

### 登录流程

1. 用户选择第三方登录方式（Google/GitHub）
2. 调用 `/login/connector/auth` 获取授权 URL
3. 跳转到第三方授权页面
4. 授权成功后回调到 `/auth/callback/:provider`
5. 前端调用 `/login/connector/callback/:provider` 获取用户信息
6. 保存 X-Token 和用户信息到本地存储

### 页面管理

- **我的空间** - 查看所有书签页面
- **创建页面** - 新建书签页面，支持添加标题、描述和链接
- **编辑页面** - 修改页面内容，支持添加/编辑/删除链接
- **删除页面** - 删除不需要的页面
- **页面排序** - 拖拽调整页面顺序（待实现）

### 链接管理

- **添加链接** - 支持标题、URL、标签和子链接
- **编辑链接** - 修改链接信息
- **删除链接** - 移除不需要的链接
- **子链接** - 为主链接添加相关子链接

### 权限分享

- **只读链接** - 其他人可以查看但不能编辑
- **编辑链接** - 其他人可以查看和编辑
- **超级权限链接** - 其他人拥有完全控制权限

## 🌐 环境配置

项目支持三个环境，根据域名自动切换：

- **本地环境** (`localhost:3000`) → API: `http://127.0.0.1:80`
- **测试环境** (`test.forgeturl.com`) → API: `https://test-api.brightguo.com`
- **生产环境** (`forgeturl.com`) → API: `https://api.brightguo.com`

## 🔐 认证机制

### X-Token

- 登录成功后从响应头获取
- 保存到 localStorage
- 每次请求自动携带在请求头中

### X-Forget-Cookie

- 登录流程中临时存储在 sessionStorage
- 用于维持登录状态跨页面跳转
- 登录完成后自动清除

## 📱 响应式设计

使用 Tailwind CSS 的响应式类实现：

- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上

## 🎨 设计风格

- **极简主义** - 类似 X.com 和 ChatGPT 的简约设计
- **黑白灰色调** - 主色调为黑白灰，点缀蓝色
- **大量留白** - 专注内容，减少视觉干扰
- **圆角设计** - 柔和的圆角卡片和按钮
- **平滑动画** - 流畅的过渡效果

## 🐛 已知问题

- 拖拽排序功能待完善
- 移动端部分交互待优化
- 图片上传功能待实现

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过 Issue 联系我们。
