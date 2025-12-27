# 快速开始指南

## 5分钟快速上手

### 1. 安装依赖

```bash
cd forgeturl-website-claude-4.5-sonnet
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 开始使用

#### 登录
1. 点击"使用 Google/GitHub/微信 登录"
2. 完成第三方授权
3. 自动跳转到首页

#### 创建页面
1. 点击"创建页面"按钮
2. 输入标题和描述
3. （可选）添加第一个链接
4. 点击"创建页面"

#### 添加链接
1. 进入页面详情
2. 点击"编辑"按钮
3. 点击"添加链接"
4. 输入链接信息
5. 点击"保存"

#### 分享页面
1. 进入页面详情
2. 点击分享图标
3. 选择权限类型（只读/编辑/超级权限）
4. 点击"生成链接"
5. 复制链接分享给他人

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
```

## 目录结构速览

```
src/
├── views/          # 页面
│   ├── Login.vue           # 登录页
│   ├── Home.vue            # 首页
│   ├── PageDetail.vue      # 页面详情
│   └── SharePage.vue       # 分享页
├── components/     # 组件
├── api/           # API接口
├── stores/        # 状态管理
├── router/        # 路由
└── utils/         # 工具函数
```

## 核心概念

### 页面（Page）
- 包含标题、描述和链接集合
- 支持版本控制
- 可以分享给他人

### 链接（Link）
- 包含标题、URL、标签
- 支持子链接
- 可以编辑和删除

### 权限
- **只读**: 只能查看
- **编辑**: 可以查看和编辑
- **超级权限**: 完全控制

## 环境说明

- **本地**: http://localhost:3000 → API: http://127.0.0.1:80
- **测试**: test.forgeturl.com → API: https://test-api.brightguo.com
- **生产**: forgeturl.com → API: https://api.brightguo.com

## 故障排除

### 无法登录
- 检查后端服务是否运行
- 检查API地址是否正确
- 清除浏览器缓存和localStorage

### 页面无法保存
- 检查登录状态
- 查看浏览器控制台错误
- 确认网络连接正常

### 样式显示异常
- 确认Tailwind CSS已正确配置
- 清除浏览器缓存
- 重启开发服务器

## 下一步

- 阅读 [README.md](./README.md) 了解更多功能
- 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 学习开发指南
- 访问 [需求.md](./需求.md) 了解需求背景

## 需要帮助？

遇到问题请：
1. 查看浏览器控制台错误信息
2. 检查 Network 面板的 API 请求
3. 提交 Issue 描述问题

