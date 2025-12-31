/**
 * 认证相关的组合式函数
 */
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getAuthUrl, authCallback } from '@/api/auth'
import { storage, sessionStorage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/config'

export function useAuth() {
    const router = useRouter()
    const authStore = useAuthStore()

    /**
     * 发起第三方登录
     */
    const startAuth = async (provider) => {
        try {
            const data = await getAuthUrl(provider)

            if (data.auth_url) {
                // 跳转到第三方授权页面
                window.location.href = data.auth_url
            } else {
                throw new Error('Failed to get authorization URL')
            }
        } catch (error) {
            console.error('Start auth error:', error)
            throw error
        }
    }

    /**
     * 处理登录回调
     */
    const handleAuthCallback = async (provider, params) => {
        try {
            // 调用回调接口
            const data = await authCallback(provider, params)

            // 登录成功，保存用户信息
            if (data) {
                const userInfo = {
                    uid: data.uid,
                    username: data.username,
                    displayName: data.display_name,
                    avatar: data.avatar,
                    email: data.email,
                    isNewUser: data.is_new_user
                }

                // 从localStorage获取token（已在request拦截器中自动保存）
                const token = storage.get(STORAGE_KEYS.TOKEN) || 'auto-saved'

                // 保存到store
                authStore.login(userInfo, token)

                // 清除X-Forget-Cookie
                sessionStorage.remove(STORAGE_KEYS.FORGET_COOKIE)

                return userInfo
            }
        } catch (error) {
            console.error('Handle auth callback error:', error)
            throw error
        }
    }

    /**
     * 登出
     */
    const handleLogout = async () => {
        try {
            await authStore.logout()
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            // 即使出错也跳转到登录页
            router.push('/login')
        }
    }

    return {
        startAuth,
        handleAuthCallback,
        handleLogout,
        isLoggedIn: authStore.isLoggedIn,
        user: authStore.user
    }
}

