<template>
  <EditDialog
    :show="show"
    :title="t('modal.editPageInfo')"
    :description="copy.description"
    :dirty="dirty"
    :busy="busy"
    :error="error"
    :submit-label="t(busy ? 'modal.saving' : 'linkEditor.save')"
    :can-submit="dirty && !!localTitle.trim()"
    @update:show="emit('update:show', $event)"
    @submit="handleConfirm"
  >
    <div class="space-y-5">
      <label class="editor-field">
        <span>{{ t('modal.pageName') }} <span class="text-violet-500" aria-hidden="true">*</span></span>
        <input v-model="localTitle" class="editor-control" required autofocus :placeholder="t('modal.enterPageName')" />
      </label>
      <label class="editor-field">
        <span>{{ t('modal.description') }} <span class="font-normal text-slate-400">{{ copy.optional }}</span></span>
        <textarea v-model="localBrief" class="editor-control min-h-28 resize-y" rows="4" :placeholder="t('modal.enterPageDesc')" />
      </label>
    </div>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EditDialog from './EditDialog.vue'

const props = defineProps({
  show: { type: Boolean, default: false }, title: { type: String, default: '' },
  brief: { type: String, default: '' }, saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:show', 'save'])
const { t, locale } = useI18n()
const localTitle = ref('')
const localBrief = ref('')
const initial = ref('')
const submitting = ref(false)
const error = ref('')
const busy = computed(() => submitting.value || props.saving)
const dirty = computed(() => JSON.stringify([localTitle.value, localBrief.value]) !== initial.value)
const copy = computed(() => locale.value.startsWith('zh') ? {
  description: '清晰的名称和描述，让页面更容易找到。', optional: '选填'
} : { description: 'A clear name and description make this page easier to find.', optional: 'Optional' })

watch(() => props.show, open => {
  if (!open) return
  localTitle.value = props.title || ''
  localBrief.value = props.brief || ''
  initial.value = JSON.stringify([localTitle.value, localBrief.value])
  error.value = ''
  submitting.value = false
}, { immediate: true })

function handleConfirm() {
  if (busy.value || !dirty.value || !localTitle.value.trim()) return
  submitting.value = true
  error.value = ''
  emit('save', { title: localTitle.value.trim(), brief: localBrief.value.trim() }, err => {
    submitting.value = false
    if (err) {
      error.value = err.message || t('linkEditor.saveFailed')
      return
    }
    initial.value = JSON.stringify([localTitle.value, localBrief.value])
    emit('update:show', false)
  })
}
</script>
