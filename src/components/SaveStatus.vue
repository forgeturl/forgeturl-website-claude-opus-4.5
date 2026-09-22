<template>
  <div v-if="saving || error || saved" role="status" :aria-live="error ? 'assertive' : 'polite'" class="fixed right-3 top-16 z-40 flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm md:top-4 dark:bg-slate-800" :class="error ? 'border-red-200 text-red-600 dark:border-red-900 dark:text-red-400' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'">
    <ArrowPathIcon v-if="saving" class="size-4 shrink-0 animate-spin" /><ExclamationCircleIcon v-else-if="error" class="size-4 shrink-0" /><CheckCircleIcon v-else class="size-4 shrink-0 text-emerald-600" />
    <span class="min-w-0 break-words">{{ saving ? t('page.saving') : error || t('page.saved') }}</span>
    <button v-if="error" class="shrink-0 rounded-md border border-current px-2 py-1 font-medium focus-visible:outline focus-visible:outline-2" :disabled="saving" @click="$emit('retry')">{{ t('page.retry') }}</button>
  </div>
</template>
<script setup>
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
defineProps({ saving:Boolean, saved:Boolean, error:String })
defineEmits(['retry'])
const { t } = useI18n()
</script>
