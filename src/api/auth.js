/**
 * 认证相关API
 */
import request from '@/utils/request'

/**
 * 获取第三方登录授权URL
 * @param {string} provider - 登录提供商 (google/github/weixin)
 * @returns {Promise} 返回授权URL
 */
export function getAuthUrl(provider) {
    return request({
        url: '/login/connector/auth',
        method: 'GET',
        params: { provider }
    })
}

/**
 * 第三方登录回调
 * @param {string} provider - 登录提供商
 * @param {Object} params - 回调参数（如code, state等）
 * @returns {Promise} 返回用户信息
 */
export function authCallback(provider, params = {}) {
    return request({
        url: `/login/connector/callback/${provider}`,
        method: 'GET',
        params
    })
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
    return request({
        url: '/login/logout',
        method: 'POST',
        data: {}
    })
}

/**
 * 获取用户信息
 * @param {number} uid - 用户ID
 * @returns {Promise} 返回用户信息
 */
export function getUserInfo(uid) {
    return request({
        url: '/space/getUserInfo',
        method: 'POST',
        data: { uid }
    })
}

