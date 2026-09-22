<template>
  <EditDialog
    :show="show"
    :title="t('modal.editFolderName')"
    :description="description"
    :dirty="titleValue !== initialTitle"
    :busy="saving"
    :error="error"
    :submit-label="t(saving ? 'modal.saving' : 'linkEditor.save')"
    :can-submit="titleValue !== initialTitle && !!titleValue.trim()"
    @update:show="emit('update:show', $event)"
    @submit="handleSave"
  >
    <label class="editor-field">
      <span>{{ t('modal.collectionName') }}</span>
      <input v-model="titleValue" class="editor-control" required autofocus :placeholder="t('modal.enterFolderName')" />
    </label>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EditDialog from './EditDialog.vue'

const props = defineProps({ show: { type: Boolean, default: false }, title: { type: String, default: '' } })
const emit = defineEmits(['update:show', 'save'])
const { t, locale } = useI18n()
const titleValue = ref('')
const initialTitle = ref('')
const saving = ref(false)
const error = ref('')
const description = computed(() => locale.value.startsWith('zh') ? '给这组合集一个容易辨认的名称。' : 'Choose a recognizable name for this collection of links.')

watch(() => props.show, open => {
  if (!open) return
  titleValue.value = props.title || ''
  initialTitle.value = titleValue.value
  saving.value = false
  error.value = ''
}, { immediate: true })

function handleSave() {
  if (saving.value || !titleValue.value.trim() || titleValue.value === initialTitle.value) return
  saving.value = true
  error.value = ''
  emit('save', titleValue.value.trim(), err => {
    saving.value = false
    if (err) {
      error.value = err.message || t('linkEditor.saveFailed')
      return
    }
    initialTitle.value = titleValue.value
    emit('update:show', false)
  })
}
</script>
