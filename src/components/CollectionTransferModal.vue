<template>
  <EditDialog
    :show="show"
    :title="t('collection.transferTitle')"
    :description="collectionTitle || t('collection.unnamedCollection')"
    :dirty="dirty"
    :busy="loading"
    :can-submit="canConfirm"
    :submit-label="operation === 'copy' ? t('collection.copyAction') : t('collection.moveAction')"
    width="540px"
    @update:show="emit('update:show', $event)"
    @submit="handleConfirm"
  >
    <fieldset>
      <legend class="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('collection.operation') }}</legend>
      <div class="grid grid-cols-2 gap-3">
        <label
          v-for="item in operations"
          :key="item.value"
          class="relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400"
          :class="operation === item.value
            ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/30 dark:text-violet-200'
            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'"
        >
          <input v-model="operation" type="radio" :name="operationId" :value="item.value" class="absolute right-4 top-4 size-4 accent-violet-600" :disabled="loading" />
          <component :is="item.icon" class="size-6" aria-hidden="true" />
          <span class="text-sm font-medium">{{ item.label }}</span>
        </label>
      </div>
      <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ operation === 'copy' ? t('collection.copyHint') : t('collection.moveHint') }}</p>
    </fieldset>

    <label class="editor-field">
      <span>{{ t('collection.targetPage') }}</span>
      <select v-model="targetPageId" class="editor-control" :disabled="loading" required>
        <option value="" disabled>{{ t('collection.selectTargetPage') }}</option>
        <option v-for="page in targetPages" :key="page.page_id" :value="page.page_id">
          {{ page.title || t('space.unnamedPage') }}{{ page.page_id === currentPageId ? ' (' + t('collection.currentPage') + ')' : '' }}
        </option>
      </select>
    </label>
    <p v-if="targetPages.length === 0" role="status" class="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">{{ t('collection.noEditableTargetPages') }}</p>
    <template #status><span v-if="loading">{{ t('collection.transferring') }}</span><span v-else-if="dirty">{{ t('linkEditor.closeHint') }}</span></template>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRightCircleIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'
import EditDialog from './EditDialog.vue'

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
const initialSelection = ref('')
const operationId = 'collection-operation-' + useId()
const operations = computed(() => [
  { value: 'copy', label: t('collection.copyAction'), icon: DocumentDuplicateIcon },
  { value: 'move', label: t('collection.moveAction'), icon: ArrowRightCircleIcon }
])
const editablePages = computed(() => props.pages.filter(page => page.page_conf?.can_edit))
const targetPages = computed(() => editablePages.value.filter(page => (
  operation.value === 'copy' || page.page_id !== props.currentPageId
)))
const canConfirm = computed(() => (
  !props.loading &&
  Boolean(targetPageId.value) &&
  targetPages.value.some(page => page.page_id === targetPageId.value) &&
  !(operation.value === 'move' && targetPageId.value === props.currentPageId)
))
const dirty = computed(() => JSON.stringify([operation.value, targetPageId.value]) !== initialSelection.value)

watch(() => props.show, show => {
  if (!show) return
  operation.value = 'copy'
  targetPageId.value = targetPages.value.some(page => page.page_id === props.currentPageId)
    ? props.currentPageId
    : (targetPages.value[0]?.page_id || '')
  initialSelection.value = JSON.stringify([operation.value, targetPageId.value])
}, { immediate: true })

watch(operation, () => {
  if (!targetPages.value.some(page => page.page_id === targetPageId.value)) {
    targetPageId.value = targetPages.value[0]?.page_id || ''
  }
})

function handleConfirm() {
  if (!canConfirm.value) return
  emit('confirm', { operation: operation.value, targetPageId: targetPageId.value })
}
</script>
