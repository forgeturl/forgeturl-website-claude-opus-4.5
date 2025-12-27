/**
 * 环境配置
 * 根据当前域名自动切换API地址
 */

const getApiBaseUrl = () => {
    const hostname = window.location.hostname

    // 本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:80'
    }

    // 测试环境
    if (hostname.includes('test')) {
        return 'https://test-api.brightguo.com'
    }

    // 生产环境
    return 'https://api.brightguo.com'
}

export const API_BASE_URL = getApiBaseUrl()

// 第三方登录提供商
export const AUTH_PROVIDERS = {
    GOOGLE: 'google',
    GITHUB: 'github',
    WEIXIN: 'weixin'
}

// 页面权限类型
export const PAGE_TYPES = {
    READONLY: 'readonly',
    EDIT: 'edit',
    ADMIN: 'admin'
}

// 存储键名
export const STORAGE_KEYS = {
    TOKEN: 'x-token',
    USER_INFO: 'user-info',
    FORGET_COOKIE: 'x-forget-cookie'
}

