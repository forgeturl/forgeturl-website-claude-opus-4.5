<template>
  <Dialog :open="show" @close="() => {}" class="relative z-50">
    <div class="fixed inset-0 bg-slate-950/35 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
      <DialogPanel ref="panel" data-edit-dialog class="edit-dialog flex w-full flex-col overflow-hidden rounded-t-2xl bg-white text-slate-900 shadow-2xl sm:rounded-2xl dark:bg-slate-800 dark:text-slate-100" :style="{ maxWidth: width }">
        <header :inert="confirmClose" class="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-slate-700">
          <div class="min-w-0 flex-1"><DialogTitle class="text-lg font-semibold tracking-tight">{{ title }}</DialogTitle><DialogDescription v-if="description" class="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</DialogDescription></div>
          <span v-if="dirty" class="mt-1 shrink-0 text-xs text-amber-600 dark:text-amber-400">{{ t('unsaved') }}</span>
          <button type="button" class="editor-icon" :aria-label="t('close')" :disabled="busy" @click="requestClose"><XMarkIcon class="size-5" /></button>
        </header>
        <form ref="form" :inert="confirmClose" class="flex min-h-0 flex-1 flex-col" @submit.prevent="submit">
          <div class="min-h-0 overflow-y-auto p-5 sm:p-6"><fieldset :disabled="busy" class="min-w-0 space-y-5"><slot /></fieldset></div>
          <footer class="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 sm:px-6 dark:border-slate-700 dark:bg-slate-900/30">
            <p v-if="error" role="alert" class="mb-3 text-sm leading-5 text-red-600 dark:text-red-400">{{ error }}</p>
            <div class="flex flex-wrap items-center justify-end gap-2.5"><div class="mr-auto text-xs text-slate-500 dark:text-slate-400" role="status"><slot name="status"><span v-if="busy">{{ t('saving') }}</span><span v-else-if="dirty">{{ t('guardHint') }}</span></slot></div><button v-if="showCancel" type="button" class="editor-secondary" :disabled="busy" @click="requestClose">{{ t('cancel') }}</button><button type="submit" class="editor-primary" :disabled="busy || !canSubmit">{{ busy ? t('saving') : submitLabel || t('save') }}</button></div>
          </footer>
        </form>
        <div v-if="confirmClose" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/25 p-5" @keydown.tab="trapConfirm">
          <div ref="confirmation" role="alertdialog" aria-modal="true" :aria-labelledby="confirmId" class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800">
            <h4 :id="confirmId" class="text-lg font-semibold">{{ t('leaveTitle') }}</h4><p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{{ t('leaveHint') }}</p>
            <div class="mt-5 flex flex-wrap justify-end gap-2"><button ref="continueButton" type="button" class="editor-secondary" @click="keepEditing">{{ t('continue') }}</button><button type="button" class="editor-secondary !text-red-600" @click="close(true)">{{ t('discard') }}</button><button type="button" class="editor-primary" :disabled="!canSubmit" @click="submitFromConfirm">{{ submitLabel || t('save') }}</button></div>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, useId } from 'vue'
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const props = defineProps({ show: Boolean, title: String, description: String, dirty: Boolean, busy: Boolean, error: String, submitLabel: String, showCancel: { type: Boolean, default: true }, canSubmit: { type: Boolean, default: true }, width: { type: String, default: '520px' } })
const emit = defineEmits(['update:show', 'submit', 'discard', 'closed'])
const { t } = useI18n({ useScope: 'local', inheritLocale: true, fallbackLocale: 'en', messages: {
  'zh-CN': { unsaved:'未保存',close:'关闭',saving:'保存中…',guardHint:'关闭前会提醒保存',cancel:'取消',save:'保存更改',leaveTitle:'修改尚未保存',leaveHint:'继续编辑，或放弃本次修改。保存成功后才能退出。',continue:'继续编辑',discard:'放弃修改' },
  en: { unsaved:'Unsaved',close:'Close',saving:'Saving…',guardHint:'Changes are protected before closing',cancel:'Cancel',save:'Save changes',leaveTitle:'Unsaved changes',leaveHint:'Keep editing or discard your changes. Saving must succeed before leaving.',continue:'Keep editing',discard:'Discard changes' }
} })
const router = useRouter()
const form = ref(null), panel = ref(null), confirmation = ref(null), continueButton = ref(null)
const confirmClose = ref(false), confirmId = `edit-confirm-${useId()}`
let previousFocus, decideNavigation = null, savingForNavigation = false
function close(discard = false) {
  if (props.busy) return
  confirmClose.value = false
  if (discard) emit('discard')
  emit('update:show', false); emit('closed')
  decideNavigation?.(true); decideNavigation = null
}
async function requestClose() {
  if (props.busy) return
  if (confirmClose.value) { keepEditing(); return }
  if (!props.dirty) { close(); return }
  previousFocus = document.activeElement; confirmClose.value = true
  await nextTick(); continueButton.value?.focus()
}
function keepEditing() { confirmClose.value = false; decideNavigation?.(false); decideNavigation = null; nextTick(() => previousFocus?.focus()) }
function submit() { if (!props.busy && props.canSubmit && form.value?.reportValidity()) emit('submit') }
async function submitFromConfirm() { confirmClose.value = false; savingForNavigation = !!decideNavigation; await nextTick(); submit(); if (!props.busy) { await nextTick(); if (!props.busy) { decideNavigation?.(false); decideNavigation = null } } }
function trapConfirm(event) { const buttons = [...confirmation.value.querySelectorAll('button:not(:disabled)')]; event.preventDefault(); const i = buttons.indexOf(document.activeElement); buttons[(i + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus() }
watch(() => props.show, (show) => { if (!show) { confirmClose.value = false; decideNavigation?.(true); decideNavigation = null } })
watch(() => props.busy, (busy, wasBusy) => { if (wasBusy && !busy && savingForNavigation) { nextTick(() => { if (props.show) { decideNavigation?.(false); decideNavigation = null }; savingForNavigation = false }) } })
function keydown(event) { if (!confirmClose.value && event.target?.matches?.('[data-sublink-field], [data-sublink-action]')) return; if (props.show && event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); requestClose() } }
function beforeUnload(event) { if (props.show && (props.dirty || props.busy)) { event.preventDefault(); event.returnValue = '' } }
const removeGuard = router.beforeEach(() => { if (!props.show) return true; if (props.busy) return false; if (!props.dirty) return true; if (decideNavigation) return false; return new Promise(resolve => { decideNavigation = resolve; requestClose() }) })
onMounted(() => { window.addEventListener('keydown', keydown, true); window.addEventListener('beforeunload', beforeUnload) })
onUnmounted(() => { removeGuard(); decideNavigation?.(false); window.removeEventListener('keydown', keydown, true); window.removeEventListener('beforeunload', beforeUnload) })
</script>
<style>
.edit-dialog { position: relative; max-height: 92dvh; }
.editor-field { @apply grid min-w-0 gap-2 text-sm font-medium text-slate-600 dark:text-slate-300; }
.editor-control { @apply block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-violet-900; }
.editor-primary { @apply inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50; }
.editor-secondary { @apply inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200; }
.editor-icon { @apply flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700; }
@media (max-width: 639px) { .edit-dialog { max-height: 95dvh; } .edit-dialog footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); } }
</style>
