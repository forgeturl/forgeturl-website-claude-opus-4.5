/**
 * 页面状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resolveNextPageVersion } from '@/utils/pageVersion'
import {
    getMySpace,
    getPage,
    createPage as apiCreatePage,
    updatePage as apiUpdatePage,
    transferCollection as apiTransferCollection,
    deletePage as apiDeletePage,
    savePageIds as apiSavePageIds,
    addPageLink as apiAddPageLink,
    removePageLink as apiRemovePageLink
} from '@/api/space'

export const usePageStore = defineStore('page', () => {
    // 状态
    const myPages = ref([])
    const currentPage = ref(null)
    const loading = ref(false)
    const spaceName = ref('')

    // 获取我的空间
    const fetchMySpace = async () => {
        loading.value = true
        try {
            const data = await getMySpace()
            myPages.value = data.page_briefs || []
            spaceName.value = data.space_name || 'My Space'
            return data
        } catch (error) {
            console.error('Fetch my space error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取页面详情
    const fetchPage = async (pageId) => {
        loading.value = true
        try {
            const data = await getPage(pageId)
            currentPage.value = data.page || data
            return currentPage.value
        } catch (error) {
            console.error('Fetch page error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 创建页面
    const createPage = async (pageData) => {
        loading.value = true
        try {
            const result = await apiCreatePage(pageData)
            // 创建成功后刷新我的空间
            await fetchMySpace()
            return result
        } catch (error) {
            console.error('Create page error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 更新页面
    const updatePage = async (pageData) => {
        loading.value = true
        try {
            const result = await apiUpdatePage(pageData)

            // 后端使用乐观锁保存，成功后版本必定递增。直接同步版本和页面摘要，
            // 避免立即保存期间额外拉取页面覆盖用户刚刚做出的下一次修改。
            const nextVersion = resolveNextPageVersion(result?.version, pageData.version)
            const updateTime = result?.update_time
            const mask = Number(pageData.mask || 0)
            const applySavedFields = (page) => {
                if (!page || page.page_id !== pageData.page_id) return
                page.version = nextVersion
                if (updateTime) page.update_time = updateTime
                if ((mask & 1) !== 0) page.title = pageData.title
                if ((mask & 2) !== 0) page.brief = pageData.brief
            }

            applySavedFields(currentPage.value)
            const index = myPages.value.findIndex(p => p.page_id === pageData.page_id)
            if (index !== -1) {
                applySavedFields(myPages.value[index])
            }
            return { ...(result || {}), version: nextVersion }
        } catch (error) {
            console.error('Update page error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const transferCollection = async ({
        sourcePageId,
        targetPageId,
        sourceCollectionIndex,
        operation,
        sourceVersion
    }) => {
        loading.value = true
        try {
            const targetData = await getPage(targetPageId)
            const targetPage = targetData.page || targetData
            const result = await apiTransferCollection({
                source_page_id: sourcePageId,
                target_page_id: targetPageId,
                source_collection_index: sourceCollectionIndex,
                operation,
                source_version: sourceVersion,
                target_version: targetPage.version
            })

            const applySourceVersion = (page) => {
                if (!page || page.page_id !== sourcePageId) return
                page.version = result.source_version
                if (result.update_time) page.update_time = result.update_time
            }
            applySourceVersion(currentPage.value)
            applySourceVersion(myPages.value.find((page) => page.page_id === sourcePageId))

            const targetBrief = myPages.value.find((page) => page.page_id === targetPageId)
            if (targetBrief && result.update_time) {
                targetBrief.update_time = result.update_time
            }
            return result
        } finally {
            loading.value = false
        }
    }

    // 删除页面
    const deletePage = async (pageId) => {
        loading.value = true
        try {
            await apiDeletePage(pageId)
            // 删除成功后刷新我的空间
            await fetchMySpace()
            // 清空当前页面
            if (currentPage.value?.page_id === pageId) {
                currentPage.value = null
            }
        } catch (error) {
            console.error('Delete page error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 保存页面顺序
    const savePageOrder = async (pageIds) => {
        loading.value = true
        try {
            const result = await apiSavePageIds(pageIds)
            // 更新本地页面顺序
            if (result.page_ids) {
                const pageMap = new Map(myPages.value.map(p => [p.page_id, p]))
                myPages.value = result.page_ids
                    .map(id => pageMap.get(id))
                    .filter(Boolean)
            }
            return result
        } catch (error) {
            console.error('Save page order error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 生成页面链接
    const addPageLink = async (pageId, pageType) => {
        loading.value = true
        try {
            const result = await apiAddPageLink(pageId, pageType)
            // 刷新当前页面以获取最新的链接信息
            await fetchPage(pageId)
            
            // 同步更新 myPages 中对应的页面
            if (currentPage.value) {
                const index = myPages.value.findIndex(p => p.page_id === pageId)
                if (index !== -1) {
                    myPages.value[index] = { ...myPages.value[index], ...currentPage.value }
                }
            }
            return result
        } catch (error) {
            console.error('Add page link error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 删除页面链接
    const removePageLink = async (pageId, pageType) => {
        loading.value = true
        try {
            await apiRemovePageLink(pageId, pageType)
            // 刷新当前页面
            await fetchPage(pageId)
            
            // 同步更新 myPages 中对应的页面
            if (currentPage.value) {
                const index = myPages.value.findIndex(p => p.page_id === pageId)
                if (index !== -1) {
                    myPages.value[index] = { ...myPages.value[index], ...currentPage.value }
                }
            }
        } catch (error) {
            console.error('Remove page link error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 清空状态
    const clear = () => {
        myPages.value = []
        currentPage.value = null
        spaceName.value = ''
    }

    return {
        // 状态
        myPages,
        currentPage,
        loading,
        spaceName,

        // 方法
        fetchMySpace,
        fetchPage,
        createPage,
        updatePage,
        transferCollection,
        deletePage,
        savePageOrder,
        addPageLink,
        removePageLink,
        clear
    }
})
