/**
 * 路由配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS, MAIN_DOMAIN, isWechatLoginDomain } from '@/utils/config'
import i18n from '@/i18n'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { titleKey: 'pageTitles.home' }
    },
    {
        path: '/my',
        name: 'MySpace',
        component: () => import('@/views/MySpace.vue'),
        meta: { requiresAuth: true, titleKey: 'pageTitles.mySpace' }
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
        meta: { titleKey: 'pageTitles.signingIn' }
    },
    {
        path: '/page/:pageId',
        name: 'PageDetail',
        component: () => import('@/views/PageDetail.vue'),
        meta: { requiresAuth: true, titleKey: 'pageTitles.pageDetail' }
    },
    {
        path: '/share/:pageId',
        name: 'SharePage',
        component: () => import('@/views/SharePage.vue'),
        meta: { titleKey: 'pageTitles.sharedPage' }
    },
    {
        path: '/privacy',
        name: 'PrivacyPolicy',
        component: () => import('@/views/PrivacyPolicy.vue'),
        meta: { titleKey: 'pageTitles.privacyPolicy' }
    },
    {
        path: '/terms',
        name: 'TermsOfService',
        component: () => import('@/views/TermsOfService.vue'),
        meta: { titleKey: 'pageTitles.termsOfService' }
    },
    {
        path: '/changelog',
        name: 'Changelog',
        component: () => import('@/views/Changelog.vue'),
        meta: { titleKey: 'pageTitles.changelog' }
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
    const t = i18n.global.t
    if (to.meta.titleKey) {
        const translated = t(to.meta.titleKey)
        if (translated.includes('ForgetURL')) {
            document.title = translated
        } else {
            document.title = `${translated} - ForgetURL`
        }
    } else {
        document.title = t('pageTitles.home')
    }

    // 处理微信跨域登录回传的token
    // 当用户在 forgeturl.brightguo.com 完成微信登录后，会被重定向回
    // forgeturl.com/?wechat_token=xxx&wechat_user=base64(userInfo)
    if (to.query.wechat_token && to.query.wechat_user) {
        try {
            const token = decodeURIComponent(to.query.wechat_token)
            const userInfo = JSON.parse(decodeURIComponent(atob(decodeURIComponent(to.query.wechat_user))))

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

    // 微信登录域名(forgeturl.brightguo.com)仅用于微信OAuth中转，
    // 需要认证的路由直接跳转回主站(forgeturl.com)
    if (to.meta.requiresAuth && isWechatLoginDomain()) {
        window.location.href = `${MAIN_DOMAIN}${to.fullPath}`
        return
    }

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const authStore = useAuthStore()

        if (!authStore.isLoggedIn) {
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

