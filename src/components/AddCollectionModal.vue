<template>
  <EditDialog
    :show="show"
    :title="t('modal.newCollection')"
    :description="copy.description"
    :dirty="!!collectionName || position !== 'tail'"
    :busy="saving"
    :error="error"
    :submit-label="t(saving ? 'modal.creating' : 'modal.create')"
    @update:show="emit('update:show', $event)"
    @submit="handleConfirm"
  >
    <div class="space-y-6">
      <label class="editor-field">
        <span>{{ t('modal.collectionName') }}</span>
        <input v-model="collectionName" class="editor-control" autofocus :placeholder="t('modal.newCollection')" />
      </label>
      <fieldset>
        <legend class="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('modal.position') }}</legend>
        <div class="grid grid-cols-2 gap-3">
          <label v-for="option in ['head', 'tail']" :key="option" class="relative flex cursor-pointer flex-col items-start gap-3 rounded-xl border p-4 transition-colors" :class="position === option ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/30 dark:text-violet-200' : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'">
            <input v-model="position" type="radio" name="collection-position" :value="option" class="absolute right-4 top-4 size-4 accent-violet-600" />
            <ArrowUpOnSquareIcon v-if="option === 'head'" class="size-6" /><ArrowDownOnSquareIcon v-else class="size-6" />
            <span class="text-sm font-medium">{{ t(option === 'head' ? 'modal.addToHead' : 'modal.addToTail') }}</span>
          </label>
        </div>
        <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ copy.positionHint }}</p>
      </fieldset>
    </div>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import EditDialog from './EditDialog.vue'

const props = defineProps({ show: { type: Boolean, default: false } })
const emit = defineEmits(['update:show', 'confirm'])
const { t, locale } = useI18n()
const collectionName = ref('')
const position = ref('tail')
const saving = ref(false)
const error = ref('')
const copy = computed(() => locale.value.startsWith('zh') ? {
  description: '把相关链接放在一起，让页面保持有序。', positionHint: '选择新合集在页面中的位置，之后也可以调整。'
} : {
  description: 'Keep related links together and your page organized.', positionHint: 'Choose where to place the collection. You can reorder it later.'
})

watch(() => props.show, open => {
  if (!open) return
  collectionName.value = ''
  position.value = 'tail'
  saving.value = false
  error.value = ''
}, { immediate: true })

function handleConfirm() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  emit('confirm', { name: collectionName.value.trim() || t('modal.newCollection'), position: position.value }, err => {
    saving.value = false
    if (err) {
      error.value = err.message || t('linkEditor.saveFailed')
      return
    }
    collectionName.value = ''
    position.value = 'tail'
    emit('update:show', false)
  })
}
</script>
