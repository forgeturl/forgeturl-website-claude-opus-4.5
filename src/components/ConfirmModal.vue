<template>
  <Dialog :open="show" :initial-focus="safeButton" class="relative z-[70]" @close="handleClose">
    <div class="fixed inset-0 bg-slate-950/35 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
      <DialogPanel class="w-full max-w-[420px] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-800">
        <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-700">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="tone"><component :is="icon" class="size-5" aria-hidden="true" /></div>
          <DialogTitle class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title || t('title') }}</DialogTitle>
        </div>
        <DialogDescription class="max-h-[60dvh] overflow-y-auto px-6 py-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ message }}</DialogDescription>
        <div class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:px-6 dark:border-slate-700 dark:bg-slate-900/30">
          <button ref="safeButton" type="button" class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" @click="handleClose">{{ cancelText || t('cancel') }}</button>
          <button type="button" class="rounded-lg px-4 py-2.5 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500" :class="type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'" @click="handleConfirm">{{ confirmText || t('confirm') }}</button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
<script setup>
import { computed, ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
const props = defineProps({ show: Boolean, type: { type: String, default: 'warning' }, title: String, message: { type: String, default: '' }, confirmText: String, cancelText: String })
const safeButton = ref(null)
const { t } = useI18n({ useScope: 'local', fallbackLocale: 'en', messages: {
  'zh-CN': { title: '请确认', cancel: '取消', confirm: '确定' },
  en: { title: 'Confirm', cancel: 'Cancel', confirm: 'OK' }
} })
const icon = computed(() => ({ danger: ExclamationTriangleIcon, warning: ExclamationTriangleIcon, error: XCircleIcon, success: CheckCircleIcon }[props.type] || InformationCircleIcon))
const tone = computed(() => ({ danger: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400', error: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400', success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400', warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' }[props.type] || 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400'))
const emit = defineEmits(['update:show', 'confirm', 'cancel'])
function handleClose() { emit('update:show', false); emit('cancel') }
function handleConfirm() { emit('update:show', false); emit('confirm') }
</script>
