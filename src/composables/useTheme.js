import { ref, watch } from 'vue'

// 主题状态 - 全局单例
const isDark = ref(false)

// 初始化标志
let initialized = false

// 从 localStorage 获取主题
const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('theme')
    if (stored) {
      return stored === 'dark'
    }
    // 默认跟随系统
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  } catch {
    return false
  }
}

// 保存主题到 localStorage
const saveTheme = (dark) => {
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  } catch {
    // ignore
  }
}

// 应用主题到 DOM
const applyTheme = (dark) => {
  if (typeof document === 'undefined') return
  
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 立即初始化（在模块加载时）
const initTheme = () => {
  if (initialized) return
  if (typeof window === 'undefined') return
  
  initialized = true
  isDark.value = getStoredTheme()
  applyTheme(isDark.value)
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // 只有当用户没有手动设置过主题时才跟随系统
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      applyTheme(isDark.value)
    }
  })
}

// 立即执行初始化
initTheme()

export function useTheme() {
  // 确保初始化
  initTheme()

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    saveTheme(isDark.value)
    applyTheme(isDark.value)
  }

  // 设置主题
  const setTheme = (dark) => {
    isDark.value = dark
    saveTheme(isDark.value)
    applyTheme(isDark.value)
  }

  // 监听变化
  watch(isDark, (newVal) => {
    applyTheme(newVal)
  })

  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
}
