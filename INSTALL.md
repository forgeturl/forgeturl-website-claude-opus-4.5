# 安装与启动指南

## 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（Chrome、Firefox、Safari、Edge）

## 快速安装

### 1. 进入项目目录

```bash
cd /Users/lxy/Desktop/Git/forgeturl/forgeturl-website-claude-4.5-sonnet
```

### 2. 安装依赖

```bash
npm install
```

这将安装以下依赖：

**核心依赖:**
- vue@^3.4.21
- vue-router@^4.3.0
- pinia@^2.1.7
- axios@^1.6.7
- @headlessui/vue@^1.7.17

**开发依赖:**
- @vitejs/plugin-vue@^5.0.4
- vite@^5.1.5
- tailwindcss@^3.4.1
- postcss@^8.4.35
- autoprefixer@^10.4.18

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动。

## 构建生产版本

### 构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 环境说明

项目会根据访问的域名自动切换 API 地址：

| 环境 | 域名 | API 地址 |
|------|------|----------|
| 本地 | localhost:3000 | http://127.0.0.1:80 |
| 测试 | test.forgeturl.com | https://test-api.brightguo.com |
| 生产 | forgeturl.com | https://api.brightguo.com |

## 启动后的操作

### 1. 访问登录页

浏览器会自动打开 http://localhost:3000，你会看到登录页面。

### 2. 选择登录方式

支持两种登录方式：
- Google
- GitHub

**注意**: 本地开发时需要确保后端服务正在运行在 `http://127.0.0.1:80`

### 3. 登录成功

登录成功后会自动跳转到首页（我的空间）。

### 4. 创建第一个页面

1. 点击右上角的"创建页面"按钮
2. 填写页面标题和描述
3. 可选：添加第一个链接
4. 点击"创建页面"

### 5. 管理链接

进入页面详情后：
1. 点击"编辑"按钮
2. 添加、编辑或删除链接
3. 点击"保存"

### 6. 分享页面

1. 在页面详情页点击分享图标
2. 选择权限类型（只读/编辑/超级权限）
3. 点击"生成链接"
4. 复制链接分享给他人

## 故障排除

### 问题1: npm install 失败

**解决方案:**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题2: 开发服务器无法启动

**解决方案:**
```bash
# 检查端口是否被占用
lsof -i :3000

# 如果被占用，杀死进程或使用其他端口
# 修改 vite.config.js 中的 server.port
```

### 问题3: 登录失败

**可能原因:**
- 后端服务未启动
- API 地址配置错误
- 网络连接问题

**解决方案:**
1. 确保后端服务正在运行
2. 检查浏览器控制台的网络请求
3. 查看错误信息

### 问题4: 页面空白

**解决方案:**
```bash
# 清除浏览器缓存
# 或者在浏览器中按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)

# 重新构建
npm run build
npm run preview
```

### 问题5: 样式不显示

**解决方案:**
```bash
# 确保 Tailwind CSS 正确配置
# 检查 tailwind.config.js 和 postcss.config.js

# 重启开发服务器
npm run dev
```

## 开发工具推荐

### VS Code 扩展

- **Volar** - Vue 3 语言支持
- **Tailwind CSS IntelliSense** - Tailwind 类名提示
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

### 浏览器扩展

- **Vue.js devtools** - Vue 调试工具
- **React Developer Tools** - 开发者工具

## 性能优化建议

### 开发环境

1. 使用 Vite 的 HMR（热模块替换）
2. 保持依赖更新
3. 避免在开发中使用生产构建

### 生产环境

1. 启用 gzip 压缩
2. 使用 CDN 加速
3. 配置浏览器缓存
4. 代码分割和懒加载

## 部署到生产环境

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name forgeturl.com;
    
    root /path/to/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 处理 Vue Router 的 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署（可选）

创建 `Dockerfile`:

```dockerfile
FROM node:16 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 下一步

- 阅读 [QUICKSTART.md](./QUICKSTART.md) 快速上手
- 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解开发流程
- 参考 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解项目架构

## 获取帮助

如遇到问题：
1. 查看浏览器控制台错误
2. 检查 Network 面板的请求
3. 查看项目文档
4. 提交 Issue

祝使用愉快！🎉

