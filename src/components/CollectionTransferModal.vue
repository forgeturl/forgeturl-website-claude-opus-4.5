<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="handleClose"></div>

        <div class="relative bg-white dark:bg-slate-800 w-full sm:w-[440px] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div class="min-w-0 pr-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">{{ t('collection.transferTitle') }}</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-slate-400 truncate">
                {{ collectionTitle || t('collection.unnamedCollection') }}
              </p>
            </div>
            <button
              type="button"
              :disabled="loading"
              @click="handleClose"
              class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg disabled:opacity-50"
              :aria-label="t('modal.close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-5 space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {{ t('collection.operation') }}
              </label>
              <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-900/60 rounded-xl">
                <button
                  v-for="item in operations"
                  :key="item.value"
                  type="button"
                  @click="operation = item.value"
                  class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  :class="operation === item.value
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                >
                  {{ item.label }}
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-slate-400">
                {{ operation === 'copy' ? t('collection.copyHint') : t('collection.moveHint') }}
              </p>
            </div>

            <div>
              <label for="collection-target-page" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {{ t('collection.targetPage') }}
              </label>
              <select
                id="collection-target-page"
                v-model="targetPageId"
                class="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none"
              >
                <option value="" disabled>{{ t('collection.selectTargetPage') }}</option>
                <option
                  v-for="page in targetPages"
                  :key="page.page_id"
                  :value="page.page_id"
                >
                  {{ page.title || t('space.unnamedPage') }}{{ page.page_id === currentPageId ? ` (${t('collection.currentPage')})` : '' }}
                </option>
              </select>
              <p v-if="targetPages.length === 0" class="mt-2 text-sm text-amber-600 dark:text-amber-400">
                {{ t('collection.noEditableTargetPages') }}
              </p>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              :disabled="loading"
              @click="handleClose"
              class="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium disabled:opacity-50"
            >
              {{ t('modal.cancel') }}
            </button>
            <button
              type="button"
              :disabled="!canConfirm"
              @click="handleConfirm"
              class="px-5 py-2.5 bg-gray-900 dark:bg-violet-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-violet-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? t('collection.transferring') : (operation === 'copy' ? t('collection.copyAction') : t('collection.moveAction')) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show: { type: Boolean, default: false },
  pages: { type: Array, default: () => [] },
  currentPageId: { type: String, default: '' },
  collectionTitle: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const operation = ref('copy')
const targetPageId = ref('')
const operations = computed(() => [
  { value: 'copy', label: t('collection.copyAction') },
  { value: 'move', label: t('collection.moveAction') }
])
const editablePages = computed(() => props.pages.filter((page) => page.page_conf?.can_edit))
const targetPages = computed(() => editablePages.value.filter((page) => (
  operation.value === 'copy' || page.page_id !== props.currentPageId
)))
const canConfirm = computed(() => (
  !props.loading &&
  Boolean(targetPageId.value) &&
  targetPages.value.some((page) => page.page_id === targetPageId.value) &&
  !(operation.value === 'move' && targetPageId.value === props.currentPageId)
))

watch(() => props.show, (show) => {
  if (!show) return
  operation.value = 'copy'
  targetPageId.value = targetPages.value.some((page) => page.page_id === props.currentPageId)
    ? props.currentPageId
    : (targetPages.value[0]?.page_id || '')
})

watch(operation, () => {
  if (!targetPages.value.some((page) => page.page_id === targetPageId.value)) {
    targetPageId.value = targetPages.value[0]?.page_id || ''
  }
})

const handleClose = () => {
  if (!props.loading) emit('update:show', false)
}

const handleConfirm = () => {
  if (!canConfirm.value) return
  emit('confirm', { operation: operation.value, targetPageId: targetPageId.value })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
