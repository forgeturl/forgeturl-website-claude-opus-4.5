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
    WECHAT: 'wechat'
}

// 微信登录跨域相关配置
// 微信开放平台要求回调域名必须经过ICP备案，因此微信登录需要在备案域名上完成
export const WECHAT_LOGIN_DOMAIN = 'https://forgeturl.brightguo.com'
export const MAIN_DOMAIN = 'https://forgeturl.com'

// 判断当前是否在微信登录域名（备案域名）上
export const isWechatLoginDomain = () => {
    return window.location.hostname === 'forgeturl.brightguo.com'
}

// 判断当前是否在主域名上
export const isMainDomain = () => {
    return window.location.hostname === 'forgeturl.com'
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

