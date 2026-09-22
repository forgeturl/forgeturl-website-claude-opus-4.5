<template>
  <EditDialog
    :show="show"
    :title="t('modal.newFolder')"
    :description="description"
    :dirty="!!collectionTitle"
    :busy="saving"
    :error="error"
    :submit-label="t(saving ? 'modal.creating' : 'modal.create')"
    @update:show="emit('update:show', $event)"
    @closed="emit('cancel')"
    @submit="handleConfirm"
  >
    <div class="space-y-5">
      <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <LinkIcon class="size-5 shrink-0 text-violet-600 dark:text-violet-300" />
        <p class="min-w-0 truncate text-sm font-medium text-slate-700 dark:text-slate-200" :title="linkTitle">{{ linkTitle || t('modal.unnamed') }}</p>
      </div>
      <label class="editor-field">
        <span>{{ t('modal.collectionName') }}</span>
        <input v-model="collectionTitle" class="editor-control" autofocus :placeholder="t('modal.newFolder')" />
      </label>
    </div>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { LinkIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import EditDialog from './EditDialog.vue'

const props = defineProps({ show: { type: Boolean, default: false }, linkTitle: { type: String, default: '' } })
const emit = defineEmits(['update:show', 'confirm', 'cancel'])
const { t, locale } = useI18n()
const collectionTitle = ref('')
const saving = ref(false)
const error = ref('')
const description = computed(() => locale.value.startsWith('zh') ? '为这个链接创建一个新文件夹。' : 'Create a new folder for this link.')

watch(() => props.show, open => {
  if (!open) return
  collectionTitle.value = ''
  saving.value = false
  error.value = ''
}, { immediate: true })

function handleConfirm() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  emit('confirm', collectionTitle.value.trim() || t('modal.newFolder'), err => {
    saving.value = false
    if (err) {
      error.value = err.message || t('linkEditor.saveFailed')
      return
    }
    collectionTitle.value = ''
    emit('update:show', false)
  })
}
</script>
