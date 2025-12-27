/**
 * 路由配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true, title: '我的空间' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/auth/callback/:provider',
        name: 'AuthCallback',
        component: () => import('@/views/AuthCallback.vue'),
        meta: { title: '登录中...' }
    },
    {
        path: '/page/:pageId',
        name: 'PageDetail',
        component: () => import('@/views/PageDetail.vue'),
        meta: { requiresAuth: true, title: '页面详情' }
    },
    {
        path: '/share/:pageId',
        name: 'SharePage',
        component: () => import('@/views/SharePage.vue'),
        meta: { title: '分享页面' }
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
    document.title = to.meta.title
        ? `${to.meta.title} - ForgetURL`
        : 'ForgetURL - 极简书签管理'

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const authStore = useAuthStore()

        if (!authStore.isLoggedIn) {
            // 未登录，跳转到登录页
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 如果已登录，不允许访问登录页
    if (to.path === '/login') {
        const authStore = useAuthStore()
        if (authStore.isLoggedIn) {
            next('/')
            return
        }
    }

    next()
})

export default router

