# 开发指南

本文档提供项目开发相关的详细信息。

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器中打开
# http://localhost:3000
```

## 开发流程

### 1. 代码规范

- 使用 Vue 3 Composition API
- 遵循 Vue 官方风格指南
- 使用 ES6+ 语法
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case（除组件外）

### 2. 组件开发

#### 创建新组件

```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 组件逻辑
</script>
```

#### 组件通信

- Props: 父传子
- Emits: 子传父
- Provide/Inject: 跨层级
- Pinia Store: 全局状态

### 3. 路由管理

在 `src/router/index.js` 中添加新路由：

```javascript
{
  path: '/your-path',
  name: 'YourName',
  component: () => import('@/views/YourView.vue'),
  meta: { 
    requiresAuth: true,  // 是否需要登录
    title: '页面标题'
  }
}
```

### 4. 状态管理

使用 Pinia 创建新的 store：

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYourStore = defineStore('your-store', () => {
  // 状态
  const data = ref(null)
  
  // 方法
  const fetchData = async () => {
    // ...
  }
  
  return { data, fetchData }
})
```

### 5. API 接口

在 `src/api/` 中添加新的接口：

```javascript
import request from '@/utils/request'

export function yourApi(params) {
  return request({
    url: '/your/endpoint',
    method: 'POST',
    data: params
  })
}
```

### 6. 样式开发

#### 使用 Tailwind CSS

```vue
<div class="flex items-center gap-4 p-4 bg-white rounded-lg">
  <!-- 内容 -->
</div>
```

#### 自定义样式类

在 `src/assets/main.css` 中添加：

```css
@layer components {
  .your-custom-class {
    @apply flex items-center gap-2;
  }
}
```

## 调试技巧

### 1. Vue DevTools

安装 Vue DevTools 浏览器扩展进行调试。

### 2. 网络请求

打开浏览器开发者工具的 Network 标签查看 API 请求。

### 3. Console 日志

```javascript
console.log('Debug info:', data)
console.error('Error:', error)
```

## 常见问题

### 1. 登录失败

- 检查 API 地址是否正确
- 检查 X-Forget-Cookie 是否正确传递
- 查看浏览器控制台错误信息

### 2. 页面无法加载

- 检查路由配置是否正确
- 检查是否需要登录但未登录
- 查看控制台错误信息

### 3. 样式不生效

- 检查 Tailwind CSS 是否正确配置
- 确认类名拼写正确
- 清除浏览器缓存重试

## 性能优化

### 1. 路由懒加载

使用动态导入：

```javascript
component: () => import('@/views/YourView.vue')
```

### 2. 组件懒加载

```javascript
const YourComponent = defineAsyncComponent(() =>
  import('@/components/YourComponent.vue')
)
```

### 3. 图片优化

- 使用适当的图片格式
- 压缩图片大小
- 使用 CDN

## 构建部署

### 本地预览

```bash
npm run build
npm run preview
```

### 生产部署

```bash
# 构建
npm run build

# 将 dist 目录部署到服务器
```

### Nginx 配置

```nginx
server {
  listen 80;
  server_name forgeturl.com;
  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Git 工作流

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 提交代码
git add .
git commit -m "feat: your feature description"

# 3. 推送到远程
git push origin feature/your-feature

# 4. 创建 Pull Request
```

## 代码提交规范

使用 Conventional Commits：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

例如：
```
feat: 添加书签拖拽排序功能
fix: 修复登录回调错误
docs: 更新README文档
```

## 测试

### 手动测试清单

- [ ] 用户登录/登出
- [ ] 创建/编辑/删除页面
- [ ] 添加/编辑/删除链接
- [ ] 生成分享链接
- [ ] 复制链接功能
- [ ] 响应式布局
- [ ] 浏览器兼容性

## 联系方式

如有开发问题，请通过 Issue 或 Pull Request 联系我们。

