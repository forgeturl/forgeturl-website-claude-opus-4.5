/**
 * HTTP请求封装
 */
import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from './config'
import { storage, sessionStorage as sessionStore } from './storage'

// 创建axios实例
const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // 允许跨域请求携带凭证（cookies、自定义headers等）
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 添加X-Token
        const token = storage.get(STORAGE_KEYS.TOKEN)
        if (token) {
            config.headers['X-Token'] = token
        }

        // 添加X-Forget-Cookie（用于登录流程）
        const forgetCookie = sessionStore.get(STORAGE_KEYS.FORGET_COOKIE)
        console.log('🔍 [Request Interceptor] URL:', config.url)
        console.log('🔍 [Request Interceptor] forgetCookie from sessionStorage:', forgetCookie)
        console.log('🔍 [Request Interceptor] Raw sessionStorage value:', window.sessionStorage.getItem(STORAGE_KEYS.FORGET_COOKIE))
        if (forgetCookie) {
            config.headers['X-Forget-Cookie'] = forgetCookie
            console.log('✅ [Request Interceptor] Added X-Forget-Cookie header:', forgetCookie)
        } else {
            console.log('⚠️ [Request Interceptor] No forgetCookie found in sessionStorage')
        }

        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        console.log('🔍 [Response Interceptor] URL:', response.config.url)
        console.log('🔍 [Response Interceptor] Response headers:', response.headers)

        // 保存响应头中的X-Token
        const token = response.headers['x-token']
        if (token) {
            storage.set(STORAGE_KEYS.TOKEN, token)
            console.log('✅ [Response Interceptor] Saved X-Token:', token)
        }

        // 保存响应头中的X-Forget-Cookie
        const forgetCookie = response.headers['x-forget-cookie']
        console.log('🔍 [Response Interceptor] x-forget-cookie from response:', forgetCookie)
        if (forgetCookie) {
            sessionStore.set(STORAGE_KEYS.FORGET_COOKIE, forgetCookie)
            console.log('✅ [Response Interceptor] Saved X-Forget-Cookie:', forgetCookie)
            console.log('🔍 [Response Interceptor] Saved to sessionStorage as:', window.sessionStorage.getItem(STORAGE_KEYS.FORGET_COOKIE))
        } else {
            console.log('⚠️ [Response Interceptor] No x-forget-cookie in response headers')
        }

        // 处理响应数据
        const data = response.data

        // 如果是标准API响应格式 {code: 1, data: {...}}
        if (data && typeof data === 'object' && 'code' in data) {
            if (data.code === 1) {
                return data.data || data
            } else {
                // 业务错误
                const error = new Error(data.msg || data.message || '请求失败')
                error.code = data.code
                error.data = data
                return Promise.reject(error)
            }
        }

        return data
    },
    (error) => {
        console.error('Response error:', error)

        // 处理HTTP错误
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            switch (status) {
                case 401:
                    // 未授权，清除token并跳转到登录页
                    storage.remove(STORAGE_KEYS.TOKEN)
                    storage.remove(STORAGE_KEYS.USER_INFO)
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }
                    break
                case 403:
                    console.error('没有权限访问')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器错误')
                    break
                default:
                    console.error(`请求失败: ${status}`)
            }

            // 如果响应中有错误信息，使用它
            if (data && data.msg) {
                error.message = data.msg
            }
        } else if (error.request) {
            error.message = '网络错误，请检查您的网络连接'
        }

        return Promise.reject(error)
    }
)

export default request

