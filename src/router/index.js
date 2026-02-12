/**
 * 路由配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/config'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: 'ForgetURL - Save links, free your mind' }
    },
    {
        path: '/my',
        name: 'MySpace',
        component: () => import('@/views/MySpace.vue'),
        meta: { requiresAuth: true, title: 'My Space' }
    },
    {
        path: '/login',
        name: 'Login',
        redirect: '/'
    },
    {
        path: '/auth/callback/:provider',
        name: 'AuthCallback',
        component: () => import('@/views/AuthCallback.vue'),
        meta: { title: 'Signing In...' }
    },
    {
        path: '/page/:pageId',
        name: 'PageDetail',
        component: () => import('@/views/PageDetail.vue'),
        meta: { requiresAuth: true, title: 'Page Detail' }
    },
    {
        path: '/share/:pageId',
        name: 'SharePage',
        component: () => import('@/views/SharePage.vue'),
        meta: { title: 'Shared Page' }
    },
    {
        path: '/privacy',
        name: 'PrivacyPolicy',
        component: () => import('@/views/PrivacyPolicy.vue'),
        meta: { title: 'Privacy Policy' }
    },
    {
        path: '/terms',
        name: 'TermsOfService',
        component: () => import('@/views/TermsOfService.vue'),
        meta: { title: 'Terms of Service' }
    },
    {
        path: '/changelog',
        name: 'Changelog',
        component: () => import('@/views/Changelog.vue'),
        meta: { title: 'Changelog' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/'
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        // 如果标题已经包含品牌名，直接使用
        if (to.meta.title.includes('ForgetURL')) {
            document.title = to.meta.title
        } else {
            document.title = `${to.meta.title} - ForgetURL`
        }
    } else {
        document.title = 'ForgetURL - Save links, free your mind'
    }

    // 处理微信跨域登录回传的token
    // 当用户在 forgeturl.brightguo.com 完成微信登录后，会被重定向回
    // forgeturl.com/?wechat_token=xxx&wechat_user=base64(userInfo)
    if (to.query.wechat_token && to.query.wechat_user) {
        try {
            const token = decodeURIComponent(to.query.wechat_token)
            const userInfo = JSON.parse(atob(decodeURIComponent(to.query.wechat_user)))

            // 保存到localStorage
            storage.set(STORAGE_KEYS.TOKEN, token)
            storage.set(STORAGE_KEYS.USER_INFO, userInfo)

            // 保存到auth store
            const authStore = useAuthStore()
            authStore.login(userInfo, token)

            // 跳转到我的空间，清除URL中的敏感参数
            next({ path: '/my', replace: true })
            return
        } catch (err) {
            console.error('Failed to process wechat login token:', err)
            // 解析失败，清除参数继续正常流程
            next({ path: '/', replace: true })
            return
        }
    }

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const authStore = useAuthStore()

        if (!authStore.isLoggedIn) {
            // 未登录，跳转到首页（首页包含登录功能）
            next({
                path: '/',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    next()
})

export default router

