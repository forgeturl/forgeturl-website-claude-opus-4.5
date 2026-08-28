import { ref, computed, onUnmounted } from 'vue'

/**
 * 立即自动保存。
 *
 * 编辑发生时立刻发起保存。每次入队都保存页面数据快照，并按页面合并
 * 后续修改，避免切换页面时把上一页的修改保存到当前页。
 */
export function useAutoSave(saveFn) {
  const isDirty = ref(false)
  const isSaving = ref(false)
  const lastSaveTime = ref(null)
  const showSavedMessage = ref(false)
  const saveError = ref(null)

  const pendingSaves = new Map()
  const saveQueue = []
  let activeSavePromise = null
  let savedMessageTimer = null
  let uiDisposed = false

  const hideSavedMessage = () => {
    if (savedMessageTimer) {
      clearTimeout(savedMessageTimer)
      savedMessageTimer = null
    }
    showSavedMessage.value = false
  }

  const showSaveSuccess = () => {
    if (uiDisposed) return
    hideSavedMessage()
    showSavedMessage.value = true
    savedMessageTimer = setTimeout(() => {
      showSavedMessage.value = false
      savedMessageTimer = null
    }, 3000)
  }

  const runSaveLoop = async () => {
    isSaving.value = true

    try {
      while (saveQueue.length > 0) {
        const pageId = saveQueue.shift()
        const payload = pendingSaves.get(pageId)
        if (!payload) continue

        pendingSaves.delete(pageId)

        try {
          const result = await saveFn(payload)
          const queuedPayload = pendingSaves.get(pageId)
          if (queuedPayload) {
            const sentVersion = Number(payload.version || 0)
            const returnedVersion = Number(result?.version)
            const nextVersion = Number.isFinite(returnedVersion) && returnedVersion > sentVersion
              ? returnedVersion
              : sentVersion + 1

            if (Number(queuedPayload.version || 0) <= sentVersion) {
              queuedPayload.version = nextVersion
            }
          }

          lastSaveTime.value = new Date()
          saveError.value = null
          isDirty.value = pendingSaves.size > 0
        } catch (err) {
          console.error('Auto save error:', err)
          saveError.value = err.message || 'Save failed'
          isDirty.value = true

          // Keep the latest snapshot for an explicit retry on the next edit.
          if (!pendingSaves.has(pageId)) {
            pendingSaves.set(pageId, payload)
            saveQueue.unshift(pageId)
          }
          break
        }
      }
    } finally {
      isSaving.value = false
      activeSavePromise = null
      isDirty.value = pendingSaves.size > 0

      if (!uiDisposed && !isDirty.value && !saveError.value) {
        showSaveSuccess()
      }
    }
  }

  const executeSave = () => {
    if (!activeSavePromise) {
      activeSavePromise = runSaveLoop()
    }
    return activeSavePromise
  }

  const markDirty = (payload) => {
    if (!payload?.page_id) return

    // Callers pass a full page snapshot. Clone it so later UI mutations or a
    // page switch cannot change what this queued save will persist.
    const snapshot = JSON.parse(JSON.stringify(payload))
    const pageId = snapshot.page_id
    if (!pendingSaves.has(pageId)) {
      saveQueue.push(pageId)
    }
    pendingSaves.set(pageId, snapshot)

    isDirty.value = true
    saveError.value = null
    hideSavedMessage()
    void executeSave()
  }

  const dispose = () => {
    // Do not discard active or queued saves when navigating away. Payloads are
    // self-contained snapshots and can safely finish without the component UI.
    uiDisposed = true
    hideSavedMessage()
  }

  onUnmounted(dispose)

  const saveStatusText = computed(() => {
    if (saveError.value) return saveError.value
    if (isSaving.value) return 'Saving...'
    if (showSavedMessage.value) return 'Changes saved'
    return ''
  })

  const showProgress = computed(() => isSaving.value)

  return {
    isDirty,
    isSaving,
    lastSaveTime,
    showSavedMessage,
    saveError,
    saveStatusText,
    showProgress,
    markDirty,
    dispose
  }
}
