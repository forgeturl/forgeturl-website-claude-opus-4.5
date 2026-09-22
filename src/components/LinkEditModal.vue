<template>
  <Dialog :open="show" @close="() => {}" class="link-editor relative z-50">
    <div class="fixed inset-0 bg-slate-950/35 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <DialogPanel class="editor-panel relative flex w-full max-w-[820px] flex-col overflow-hidden rounded-t-2xl bg-white text-slate-900 shadow-2xl sm:rounded-2xl dark:bg-slate-800 dark:text-slate-100">
        <header :inert="confirmClose" class="flex shrink-0 items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-slate-700">
          <DialogTitle class="text-xl font-semibold tracking-tight">{{ t('modal.editLink') }}</DialogTitle>
          <span v-if="dirty" class="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400"><ExclamationCircleIcon class="size-4" />{{ t('linkEditor.unsaved') }}</span>
          <button type="button" class="icon-button ml-auto" :aria-label="t('linkEditor.close')" :disabled="saving" @click="requestClose"><XMarkIcon /></button>
        </header>

        <form :inert="confirmClose" novalidate ref="formEl" class="flex min-h-0 flex-1 flex-col" @submit.prevent="save">
          <div class="editor-body overflow-y-auto px-5 py-5 sm:px-7">
            <div v-if="recoverable" class="mb-5 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
              <p>{{ t('linkEditor.foundDraft') }}</p>
              <div class="mt-2 flex gap-4"><button type="button" class="text-violet-700 dark:text-violet-300" :disabled="saving" @click="restoreDraft">{{ t('linkEditor.restore') }}</button><button type="button" :disabled="saving" @click="discardRecovery">{{ t('linkEditor.discard') }}</button></div>
            </div>
            <fieldset :disabled="saving" class="min-w-0">
              <div class="space-y-4">
                <label class="main-field"><span>{{ t('modal.title') }}</span><input v-model="form.title" class="editor-input" :placeholder="t('modal.linkTitle')" /></label>
                <label class="main-field"><span>{{ t('modal.url') }}</span><input v-model="form.url" class="editor-input" type="text" inputmode="url" :placeholder="t('modal.linkUrl')" /></label>
                <div class="main-field"><label for="link-editor-tags">{{ t('modal.tags') }}</label><input v-if="showTags" id="link-editor-tags" v-model="tags" class="editor-input" :placeholder="t('modal.tagsPlaceholder')" /><button v-else type="button" class="justify-self-start text-sm text-violet-600 dark:text-violet-300" @click="showTags = true"><PlusIcon class="mr-1 inline size-4" />{{ t('linkEditor.addTags') }}</button></div>
              </div>
              <section class="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700">
                <SubLinkTable v-model="form.sub_links" :disabled="saving" :reset-key="tableEpoch" />
              </section>
            </fieldset>
          </div>
          <footer class="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7 dark:border-slate-700 dark:bg-slate-900/40">
            <p v-if="error" role="alert" class="mb-3 text-sm text-red-600 dark:text-red-400">{{ t('linkEditor.saveFailed') }} {{ error }}</p>
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-2 text-xs text-slate-500 dark:text-slate-400" role="status"><DocumentTextIcon class="size-5 shrink-0" /><div><p class="font-medium text-slate-700 dark:text-slate-200">{{ saving ? t('linkEditor.saving') : dirty ? t(draftSaved ? 'linkEditor.draftSaved' : 'linkEditor.draftUnavailable') : t('linkEditor.noChanges') }}</p><p class="mt-1">{{ dirty ? t('linkEditor.notOnServer') : t('linkEditor.closeHint') }}</p></div></div>
              <button type="button" class="secondary-button" :disabled="saving" @click="requestClose">{{ t('modal.cancel') }}</button>
              <button type="submit" class="primary-button" :disabled="saving || !dirty">{{ t(saving ? 'linkEditor.saving' : 'linkEditor.save') }}</button>
            </div>
          </footer>
        </form>
        <div v-if="confirmClose" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/25 p-5" @keydown.tab="trapConfirmation">
          <div ref="confirmEl" role="alertdialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-description" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <h4 id="discard-title" class="text-lg font-semibold">{{ t('linkEditor.leaveTitle') }}</h4>
            <p id="discard-description" class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{{ t('linkEditor.leaveHint') }}</p>
            <div class="mt-6 flex flex-wrap justify-end gap-2"><button ref="continueEl" type="button" class="secondary-button" @click="continueEditing">{{ t('linkEditor.continue') }}</button><button type="button" class="secondary-button !text-red-600" @click="discardAndClose">{{ t('linkEditor.discard') }}</button><button type="button" class="primary-button" @click="saveAndClose">{{ t('linkEditor.saveExit') }}</button></div>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { XMarkIcon, PlusIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import SubLinkTable from './SubLinkTable.vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { cloneLink, linkPayload } from '@/utils/linkEditor'

const props = defineProps({ show: Boolean, link: { type: Object, default: () => ({}) }, draftScope: { type: String, default: '' } })
const emit = defineEmits(['update:show', 'save'])
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const form = ref(cloneLink())
const tableEpoch = ref(0)
const tags = ref('')
const showTags = ref(false)
const initial = ref('')
const draftKey = ref('')
const recoverable = ref(null)
const draftSaved = ref(false)
const saving = ref(false)
const error = ref('')
const confirmClose = ref(false)
const formEl = ref(null)
const confirmEl = ref(null)
const continueEl = ref(null)
let initializing = false
let navigationDecision = null
let previousFocus = null
const payload = computed(() => linkPayload(form.value, tags.value))
const dirty = computed(() => JSON.stringify(payload.value) !== initial.value)

function deleteDraft() {
  try { sessionStorage.removeItem(draftKey.value) } catch { /* storage may be disabled */ }
  draftSaved.value = false
}
function keepDraft() {
  if (!props.show || !dirty.value) return
  try {
    sessionStorage.setItem(draftKey.value, JSON.stringify({ base: initial.value, value: payload.value }))
    draftSaved.value = true
  } catch { draftSaved.value = false }
}
watch(() => props.show, (open) => {
  if (!open) return
  initializing = true
  tableEpoch.value++
  form.value = cloneLink(props.link || {})
  tags.value = form.value.tags.join(', ')
  showTags.value = !!tags.value
  initial.value = JSON.stringify(payload.value)
  draftKey.value = `forgeturl:link-draft:${JSON.stringify([auth.user?.uid || 'guest', route.path, props.draftScope, form.value.title, form.value.url])}`
  error.value = ''; confirmClose.value = false; recoverable.value = null; draftSaved.value = false
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey.value) || 'null')
    if (saved?.base === initial.value && saved.value && Array.isArray(saved.value.sub_links) && Array.isArray(saved.value.tags)) recoverable.value = saved.value
  } catch { /* ignore invalid/unavailable storage */ }
  initializing = false
}, { immediate: true })
watch(payload, () => {
  if (initializing || !props.show) return
  if (dirty.value) keepDraft()
  else if (!recoverable.value) deleteDraft()
}, { deep: true, flush: 'sync' })
function restoreDraft() {
  if (saving.value) return
  tableEpoch.value++
  form.value = cloneLink(recoverable.value)
  tags.value = form.value.tags.join(', ')
  showTags.value = !!tags.value
  recoverable.value = null
  keepDraft()
}
function discardRecovery() { recoverable.value = null; deleteDraft() }
function finishClose() {
  confirmClose.value = false
  emit('update:show', false)
  navigationDecision?.(true); navigationDecision = null
}
async function requestClose() {
  if (saving.value) return
  if (confirmClose.value) { continueEditing(); return }
  if (!dirty.value) { finishClose(); return }
  previousFocus = document.activeElement
  confirmClose.value = true
  await nextTick(); continueEl.value?.focus()
}
function continueEditing() {
  confirmClose.value = false
  navigationDecision?.(false); navigationDecision = null
  nextTick(() => previousFocus?.focus())
}
function discardAndClose() { deleteDraft(); finishClose() }
function trapConfirmation(event) {
  const buttons = [...confirmEl.value.querySelectorAll('button')]
  const index = buttons.indexOf(document.activeElement)
  event.preventDefault()
  buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus()
}
async function saveAndClose() { confirmClose.value = false; await save() }
async function save() {
  if (saving.value) return
  await nextTick()
  if (!formEl.value.reportValidity()) {
    navigationDecision?.(false); navigationDecision = null
    return
  }
  saving.value = true; error.value = ''
  const value = JSON.parse(JSON.stringify(payload.value))
  emit('save', value, (failure) => {
    saving.value = false
    if (failure) {
      error.value = failure.message || String(failure)
      keepDraft()
      navigationDecision?.(false); navigationDecision = null
    } else {
      deleteDraft(); initial.value = JSON.stringify(value); finishClose()
    }
  })
}
function beforeUnload(event) {
  if (props.show && (dirty.value || saving.value)) { keepDraft(); event.preventDefault(); event.returnValue = '' }
}
const removeGuard = router.beforeEach(() => {
  if (!props.show) return true
  if (saving.value) return false
  if (!dirty.value) return true
  if (navigationDecision) return false
  return new Promise(resolve => { navigationDecision = resolve; requestClose() })
})
function handleKeydown(event) {
  if (!props.show || event.key !== 'Escape') return
  if (!confirmClose.value && event.target?.matches?.('[data-sublink-field], [data-sublink-action]')) return
  event.preventDefault(); event.stopImmediatePropagation(); requestClose()
}
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  window.addEventListener('keydown', handleKeydown, true)
})
onUnmounted(() => { keepDraft(); removeGuard(); window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('keydown', handleKeydown, true); navigationDecision?.(false) })
</script>

<style scoped>
.editor-panel { max-height: min(940px, 92dvh); }
.editor-input { @apply w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-violet-900; }
.main-field { @apply grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3 text-sm text-slate-600 dark:text-slate-300; }
.icon-button { @apply flex size-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-100; }
.icon-button svg { @apply size-[18px]; }
.primary-button { @apply rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50; }
.secondary-button { @apply rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200; }
@media (max-width: 639px) {
  .editor-panel { max-height: 95dvh; }
  .icon-button { @apply size-8; }
  footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
}
</style>
