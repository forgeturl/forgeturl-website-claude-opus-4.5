/**
 * 认证相关的组合式函数
 */
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getAuthUrl, authCallback } from '@/api/auth'
import { storage, sessionStorage } from '@/utils/storage'
import { STORAGE_KEYS, WECHAT_LOGIN_DOMAIN, isWechatLoginDomain, isMainDomain } from '@/utils/config'

export function useAuth() {
    const router = useRouter()
    const authStore = useAuthStore()

    /**
     * 发起第三方登录
     * 微信登录特殊处理：需要跳转到已备案域名 (forgeturl.brightguo.com) 完成OAuth流程
     */
    const startAuth = async (provider) => {
        try {
            // 微信登录：如果在主站(forgeturl.com)，需要先跳转到备案域名
            if (provider === 'wechat' && isMainDomain()) {
                window.location.href = `${WECHAT_LOGIN_DOMAIN}/?wechat_login=true`
                return
            }

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
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            // 即使出错也跳转到首页
            router.push('/')
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

