/**
 * 认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/config'
import { logout as apiLogout, getUserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
    // 状态
    const user = ref(null)
    const token = ref(null)

    // 计算属性
    const isLoggedIn = computed(() => !!token.value && !!user.value)

    // 初始化：从localStorage恢复状态
    const init = () => {
        const savedToken = storage.get(STORAGE_KEYS.TOKEN)
        const savedUser = storage.get(STORAGE_KEYS.USER_INFO)

        if (savedToken && savedUser) {
            token.value = savedToken
            user.value = savedUser
        }
    }

    // 登录
    const login = (userInfo, userToken) => {
        user.value = userInfo
        token.value = userToken

        // 保存到localStorage
        storage.set(STORAGE_KEYS.TOKEN, userToken)
        storage.set(STORAGE_KEYS.USER_INFO, userInfo)
    }

    // 登出
    const logout = async () => {
        try {
            await apiLogout()
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            // 无论API调用是否成功，都清除本地状态
            user.value = null
            token.value = null
            storage.remove(STORAGE_KEYS.TOKEN)
            storage.remove(STORAGE_KEYS.USER_INFO)
        }
    }

    // 更新用户信息
    const updateUser = (userInfo) => {
        user.value = { ...user.value, ...userInfo }
        storage.set(STORAGE_KEYS.USER_INFO, user.value)
    }

    // 刷新用户信息
    const refreshUser = async () => {
        if (!user.value?.uid) return

        try {
            const userInfo = await getUserInfo(user.value.uid)
            updateUser(userInfo)
            return userInfo
        } catch (error) {
            console.error('Refresh user info error:', error)
            throw error
        }
    }

    // 检查认证状态
    const checkAuth = () => {
        return isLoggedIn.value
    }

    return {
        // 状态
        user,
        token,
        isLoggedIn,

        // 方法
        init,
        login,
        logout,
        updateUser,
        refreshUser,
        checkAuth
    }
})

