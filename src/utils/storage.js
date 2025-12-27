/**
 * 本地存储工具
 */

export const storage = {
    /**
     * 获取localStorage中的数据
     */
    get(key) {
        try {
            const value = localStorage.getItem(key)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.error(`Error getting ${key} from localStorage:`, error)
            return null
        }
    },

    /**
     * 设置localStorage中的数据
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error setting ${key} to localStorage:`, error)
        }
    },

    /**
     * 删除localStorage中的数据
     */
    remove(key) {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error)
        }
    },

    /**
     * 清空localStorage
     */
    clear() {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    }
}

export const sessionStorage = {
    /**
     * 获取sessionStorage中的数据
     */
    get(key) {
        try {
            const value = window.sessionStorage.getItem(key)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.error(`Error getting ${key} from sessionStorage:`, error)
            return null
        }
    },

    /**
     * 设置sessionStorage中的数据
     */
    set(key, value) {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error setting ${key} to sessionStorage:`, error)
        }
    },

    /**
     * 删除sessionStorage中的数据
     */
    remove(key) {
        try {
            window.sessionStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing ${key} from sessionStorage:`, error)
        }
    },

    /**
     * 清空sessionStorage
     */
    clear() {
        try {
            window.sessionStorage.clear()
        } catch (error) {
            console.error('Error clearing sessionStorage:', error)
        }
    }
}

