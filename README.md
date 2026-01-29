<p align="center">
  <img src="https://forgeturl.com/favicon.svg" alt="ForgetURL Logo" width="100" height="100">
</p>

<h1 align="center">🎨 ForgetURL Website</h1>

<p align="center">
  <strong>Minimalist Bookmark Management Frontend - Built with Vue 3</strong>
</p>

<p align="center">
  <a href="https://forgeturl.com" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-ForgetURL.com-blue?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  English | <a href="./README_zh.md">中文</a>
</p>

---

## 📖 Introduction

ForgetURL Website is the frontend application for [ForgetURL](https://forgeturl.com) - a minimalist bookmark management platform. Built with Vue 3 and modern web technologies, it provides a clean, elegant interface for organizing and sharing your web bookmarks.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **OAuth Login** | Sign in with Google or GitHub |
| 📖 **Bookmark Pages** | Create, edit, delete bookmark pages |
| 🔗 **Flexible Sharing** | Read-only, editable, or admin share links |
| 📱 **Responsive Design** | Perfect on desktop and mobile |
| 🎨 **Minimalist UI** | Clean X.com / ChatGPT inspired design |
| 💾 **State Persistence** | Login state saved locally |
| 🌍 **Multi-environment** | Auto-switch local/test/production |

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue 3 (Composition API) |
| **Build Tool** | Vite |
| **State Management** | Pinia |
| **Router** | Vue Router 4 |
| **Styling** | Tailwind CSS |
| **UI Components** | Headless UI |
| **HTTP Client** | Axios |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/forgeturl/forgeturl-website-claude-opus-4.5.git
cd forgeturl-website-claude-opus-4.5

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/                    # API Layer
│   ├── auth.js             # Authentication APIs
│   └── space.js            # Space & page APIs
├── assets/                 # Static Assets
│   └── main.css            # Global styles
├── components/             # UI Components
│   ├── AddLinkModal.vue    # Add link modal
│   ├── CreatePageModal.vue # Create page modal
│   ├── EditPageModal.vue   # Edit page modal
│   ├── LinkCollection.vue  # Link collection component
│   ├── LinkItem.vue        # Link item component
│   ├── PageCard.vue        # Page card component
│   └── ShareModal.vue      # Share modal
├── composables/            # Composition Functions
│   ├── useAuth.js          # Authentication logic
│   ├── useAutoSave.js      # Auto-save logic
│   └── useTheme.js         # Theme logic
├── router/                 # Router Configuration
│   └── index.js            # Route definitions
├── stores/                 # State Management
│   ├── auth.js             # Auth store
│   └── page.js             # Page store
├── utils/                  # Utilities
│   ├── config.js           # Environment config
│   ├── request.js          # HTTP request wrapper
│   └── storage.js          # Local storage utils
├── views/                  # Page Views
│   ├── AuthCallback.vue    # OAuth callback
│   ├── Home.vue            # Home (My Space)
│   ├── Login.vue           # Login page
│   ├── MySpace.vue         # My Space page
│   ├── PageDetail.vue      # Page detail
│   └── SharePage.vue       # Shared page view
├── App.vue                 # Root component
└── main.js                 # Application entry
```

## 🔑 Core Features

### Authentication Flow

```
User clicks login
    ↓
GET /login/connector/auth → Get OAuth URL
    ↓
Redirect to OAuth provider (Google/GitHub)
    ↓
User authorizes
    ↓
Callback to /auth/callback/:provider
    ↓
GET /login/connector/callback/:provider
    ↓
Receive X-Token + user info
    ↓
Save to localStorage → Redirect to home
```

### Permission Sharing

| Share Type | Prefix | Permission |
|------------|--------|------------|
| Read-only | `R` | View only |
| Editable | `E` | View and edit |
| Admin | `A` | Full control |

## 🌐 Environment Configuration

The app automatically switches API endpoints based on hostname:

| Environment | Hostname | API Endpoint |
|-------------|----------|--------------|
| Local | `localhost` | `http://127.0.0.1:80` |
| Test | `test.forgeturl.com` | `https://test-api.brightguo.com` |
| Production | `forgeturl.com` | `https://api.brightguo.com` |

## 🎨 Design Philosophy

- **Minimalism** - X.com / ChatGPT inspired clean interface
- **Black & White** - Monochrome with blue accents
- **Whitespace** - Focus on content, reduce noise
- **Rounded Corners** - Soft, friendly appearance
- **Smooth Animations** - Fluid transitions

## 🔧 Development

### Code Style

- Use Vue 3 Composition API
- Follow Vue official style guide
- Use ES6+ syntax
- Component names in PascalCase

### Adding New Routes

```javascript
// src/router/index.js
{
  path: '/your-path',
  name: 'YourPage',
  component: () => import('@/views/YourPage.vue'),
  meta: { 
    requiresAuth: true,
    title: 'Page Title'
  }
}
```

### Adding New API

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

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome!

- 🐛 [Report Bugs](https://github.com/forgeturl/.github/issues/new?template=bug_report.md)
- 💡 [Request Features](https://github.com/forgeturl/.github/issues/new?template=feature_request.md)
- 📝 Improve documentation
- 🔧 Submit Pull Requests

## 🔗 Related Projects

- [ForgetURL Server](https://github.com/forgeturl/forgeturl-server) - Backend API service

---

<p align="center">
  <a href="https://forgeturl.com">
    <img src="https://img.shields.io/badge/Try_ForgetURL-→_forgeturl.com-2ea44f?style=flat-square" alt="Try ForgetURL">
  </a>
</p>

<p align="center">
  Made with ❤️ by ForgetURL Team
</p>
