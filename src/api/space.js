/**
 * 空间和页面相关API
 */
import request from '@/utils/request'

/**
 * 获取我的空间
 * @returns {Promise} 返回空间信息和页面列表
 */
export function getMySpace() {
    return request({
        url: '/space/getMySpace',
        method: 'POST',
        data: {}
    })
}

/**
 * 创建页面
 * @param {Object} data - 页面数据
 * @param {string} data.title - 页面标题
 * @param {string} data.brief - 页面描述
 * @param {Array} data.collections - 链接集合
 * @returns {Promise} 返回创建的页面ID
 */
export function createPage(data) {
    return request({
        url: '/space/createPage',
        method: 'POST',
        data
    })
}

/**
 * 获取页面详情
 * @param {string} pageId - 页面ID
 * @returns {Promise} 返回页面详细信息
 */
export function getPage(pageId) {
    return request({
        url: '/space/getPage',
        method: 'POST',
        data: { page_id: pageId }
    })
}

/**
 * 更新页面
 * @param {Object} data - 页面数据
 * @param {string} data.page_id - 页面ID
 * @param {string} data.title - 页面标题
 * @param {string} data.brief - 页面描述
 * @param {Array} data.collections - 链接集合
 * @param {number} data.version - 版本号
 * @param {number} data.mask - 更新字段掩码
 * @returns {Promise}
 */
export function updatePage(data) {
    return request({
        url: '/space/updatePage',
        method: 'POST',
        data
    })
}

/**
 * 删除页面
 * @param {string} pageId - 页面ID
 * @returns {Promise}
 */
export function deletePage(pageId) {
    return request({
        url: '/space/deletePage',
        method: 'POST',
        data: { page_id: pageId }
    })
}

/**
 * 保存页面顺序
 * @param {Array<string>} pageIds - 页面ID数组
 * @returns {Promise} 返回保存后的页面ID顺序
 */
export function savePageIds(pageIds) {
    return request({
        url: '/space/savePageIds',
        method: 'POST',
        data: { page_ids: pageIds }
    })
}

/**
 * 生成页面分享链接
 * @param {string} pageId - 页面ID
 * @param {string} pageType - 页面类型 (readonly/edit/admin)
 * @returns {Promise} 返回新的页面ID
 */
export function addPageLink(pageId, pageType) {
    return request({
        url: '/space/addPageLink',
        method: 'POST',
        data: {
            page_id: pageId,
            page_type: pageType
        }
    })
}

/**
 * 删除页面分享链接
 * @param {string} pageId - 原始页面ID（owner page id）
 * @param {string} pageType - 页面类型 (readonly/edit/admin)
 * @returns {Promise}
 */
export function removePageLink(pageId, pageType) {
    return request({
        url: '/space/removePageLink',
        method: 'POST',
        data: {
            page_id: pageId,
            page_type: pageType
        }
    })
}

