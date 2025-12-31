import { ref, computed, onUnmounted } from 'vue'

/**
 * 自动保存 composable
 * - 编辑后延迟5秒保存
 * - 5秒内有新编辑则重置计时
 * - 显示进度条
 * - 保存完成显示"已保存修改"
 */
export function useAutoSave(saveFn, delay = 5000) {
  // 状态
  const isDirty = ref(false)           // 是否有未保存的修改
  const isSaving = ref(false)          // 是否正在保存
  const saveProgress = ref(0)          // 保存进度 0-100
  const lastSaveTime = ref(null)       // 上次保存时间
  const showSavedMessage = ref(false)  // 显示已保存消息
  const saveError = ref(null)          // 保存错误

  // 定时器
  let saveTimer = null
  let progressTimer = null
  let savedMessageTimer = null

  // 进度条更新间隔（更新频率）
  const progressInterval = 50 // 50ms 更新一次
  const progressStep = (100 * progressInterval) / delay // 每次增加的进度

  // 开始保存倒计时
  const startSaveCountdown = () => {
    // 清除之前的定时器
    clearTimers()
    
    isDirty.value = true
    saveProgress.value = 0
    showSavedMessage.value = false
    saveError.value = null

    // 开始进度条动画
    progressTimer = setInterval(() => {
      saveProgress.value = Math.min(saveProgress.value + progressStep, 99)
    }, progressInterval)

    // 设置保存定时器
    saveTimer = setTimeout(async () => {
      await executeSave()
    }, delay)
  }

  // 执行保存
  const executeSave = async () => {
    // 停止进度条动画
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }

    saveProgress.value = 100
    isSaving.value = true

    try {
      await saveFn()
      lastSaveTime.value = new Date()
      isDirty.value = false
      
      // 显示已保存消息
      showSavedMessage.value = true
      savedMessageTimer = setTimeout(() => {
        showSavedMessage.value = false
      }, 3000)

    } catch (err) {
      console.error('Auto save error:', err)
      saveError.value = err.message || 'Save failed'
    } finally {
      isSaving.value = false
      // 延迟隐藏进度条
      setTimeout(() => {
        if (!isDirty.value) {
          saveProgress.value = 0
        }
      }, 500)
    }
  }

  // 标记有修改，触发自动保存
  const markDirty = () => {
    startSaveCountdown()
  }

  // 立即保存
  const saveNow = async () => {
    clearTimers()
    await executeSave()
  }

  // 清除所有定时器
  const clearTimers = () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    if (savedMessageTimer) {
      clearTimeout(savedMessageTimer)
      savedMessageTimer = null
    }
  }

  // 取消保存
  const cancelSave = () => {
    clearTimers()
    isDirty.value = false
    saveProgress.value = 0
    showSavedMessage.value = false
  }

  // 组件卸载时清理
  onUnmounted(() => {
    clearTimers()
  })

  // 保存状态文本
  const saveStatusText = computed(() => {
    if (saveError.value) return saveError.value
    if (isSaving.value) return 'Saving...'
    if (showSavedMessage.value) return 'Changes saved'
    if (isDirty.value) return 'Waiting to save...'
    return ''
  })

  // 是否显示进度条
  const showProgress = computed(() => {
    return isDirty.value && saveProgress.value > 0 && saveProgress.value < 100
  })

  return {
    isDirty,
    isSaving,
    saveProgress,
    lastSaveTime,
    showSavedMessage,
    saveError,
    saveStatusText,
    showProgress,
    markDirty,
    saveNow,
    cancelSave
  }
}

