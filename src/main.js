import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { STORAGE_KEYS } from './utils/config'

// 统一域名处理：将 localhost 重定向到 127.0.0.1
// 这样可以避免跨域导致的 sessionStorage 丢失问题
console.log('🚀 [Main.js] Current hostname:', window.location.hostname)

if (window.location.hostname === 'localhost') {
    console.log('🔄 [Main.js] Detected localhost, redirecting to 127.0.0.1')

    // 保存当前的 sessionStorage（如果有）
    // 注意：storage.js 会对值进行 JSON 序列化，所以这里直接读取原始值
    const forgetCookie = window.sessionStorage.getItem(STORAGE_KEYS.FORGET_COOKIE)
    console.log('🔍 [Main.js] forgetCookie from localStorage:', forgetCookie)

    // 构建新的 URL
    const newUrl = new URL(window.location.href)
    newUrl.hostname = '127.0.0.1'

    // 如果有 forgetCookie，通过 URL 参数传递（需要先解析 JSON）
    if (forgetCookie) {
        try {
            const cookieValue = JSON.parse(forgetCookie)
            newUrl.searchParams.set('_fc', cookieValue)
            console.log('✅ [Main.js] Will pass forgetCookie via URL parameter:', cookieValue)
        } catch (e) {
            // 如果不是 JSON，直接使用原值
            newUrl.searchParams.set('_fc', forgetCookie)
            console.log('✅ [Main.js] Will pass forgetCookie via URL parameter (raw):', forgetCookie)
        }
    } else {
        console.log('⚠️ [Main.js] No forgetCookie to pass')
    }

    console.log('🔄 [Main.js] Redirecting to:', newUrl.toString())
    // 重定向
    window.location.replace(newUrl.toString())
} else {
    console.log('✅ [Main.js] Already on 127.0.0.1, initializing app')

    // 如果是从 localhost 重定向过来的，恢复 forgetCookie
    const urlParams = new URLSearchParams(window.location.search)
    const forgetCookie = urlParams.get('_fc')
    console.log('🔍 [Main.js] forgetCookie from URL parameter:', forgetCookie)

    if (forgetCookie) {
        // 保存时需要进行 JSON 序列化，与 storage.js 保持一致
        window.sessionStorage.setItem(STORAGE_KEYS.FORGET_COOKIE, JSON.stringify(forgetCookie))
        console.log('✅ [Main.js] Restored forgetCookie to sessionStorage')
        console.log('🔍 [Main.js] Saved value:', window.sessionStorage.getItem(STORAGE_KEYS.FORGET_COOKIE))

        // 清理 URL 中的 _fc 参数
        urlParams.delete('_fc')
        const newUrl = new URL(window.location.href)
        newUrl.search = urlParams.toString()
        window.history.replaceState({}, '', newUrl.toString())
        console.log('✅ [Main.js] Cleaned URL parameter')
    } else {
        console.log('ℹ️ [Main.js] No forgetCookie in URL parameter')
    }

    // 初始化应用
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)

    app.mount('#app')
    console.log('✅ [Main.js] App mounted')
}

