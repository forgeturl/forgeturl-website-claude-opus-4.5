<template>
  <EditDialog
    :show="show"
    :title="t('modal.createPage')"
    :description="copy.description"
    :dirty="dirty"
    :busy="creating"
    :error="error"
    :submit-label="t(creating ? 'modal.creating' : 'modal.create')"
    :can-submit="!!form.title.trim()"
    width="580px"
    @update:show="emit('update:show', $event)"
    @submit="handleSubmit"
  >
    <div class="space-y-5">
      <label class="editor-field">
        <span>{{ t('modal.pageName') }} <span class="text-violet-500" aria-hidden="true">*</span></span>
        <input v-model="form.title" class="editor-control" required autofocus :placeholder="t('modal.enterPageTitle')" />
      </label>
      <label class="editor-field">
        <span>{{ t('modal.description') }} <span class="font-normal text-slate-400">{{ copy.optional }}</span></span>
        <textarea v-model="form.brief" class="editor-control min-h-24 resize-y" rows="3" :placeholder="t('modal.enterPageDesc')" />
      </label>
      <section class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <button type="button" class="flex w-full items-center gap-3 bg-slate-50/70 px-4 py-4 text-left dark:bg-slate-900/30" :aria-expanded="showFirstLink" @click="showFirstLink = !showFirstLink">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-300"><LinkIcon class="size-5" /></span>
          <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ t('modal.addFirstLink') }}</span><span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">{{ copy.firstLink }}</span></span>
          <ChevronUpIcon v-if="showFirstLink" class="size-4 text-slate-400" /><ChevronDownIcon v-else class="size-4 text-slate-400" />
        </button>
        <div v-if="showFirstLink" class="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700">
          <label class="editor-field"><span>{{ t('modal.linkTitle') }}</span><input v-model="form.link.title" class="editor-control" :required="!!form.link.url.trim()" :placeholder="t('modal.linkTitle')" /></label>
          <label class="editor-field"><span>{{ t('modal.url') }}</span><input v-model="form.link.url" class="editor-control" type="url" :required="!!form.link.title.trim()" :placeholder="t('modal.linkUrl')" /></label>
        </div>
      </section>
    </div>
  </EditDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { usePageStore } from '@/stores/page'
import EditDialog from './EditDialog.vue'

const props = defineProps({ show: { type: Boolean, default: false } })
const emit = defineEmits(['update:show', 'created'])
const { t, locale } = useI18n()
const pageStore = usePageStore()
const emptyForm = () => ({ title: '', brief: '', link: { title: '', url: '' } })
const form = ref(emptyForm())
const creating = ref(false)
const error = ref('')
const showFirstLink = ref(false)
const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(emptyForm()))
const copy = computed(() => locale.value.startsWith('zh') ? {
  description: '为一个主题创建页面，集中整理你的链接。', optional: '选填',
  firstLink: '现在添加，或创建后再慢慢整理', invalidLink: '请完整填写首个链接的标题和网址。',
  invalidUrl: '请输入有效的网址，例如 https://example.com。'
} : {
  description: 'Give your links a home, organized around one topic.', optional: 'Optional',
  firstLink: 'Add one now, or start with an empty page', invalidLink: 'Enter both a title and URL for your first link.',
  invalidUrl: 'Enter a valid URL, such as https://example.com.'
})

watch(() => props.show, open => {
  if (!open) return
  form.value = emptyForm()
  error.value = ''
  showFirstLink.value = false
}, { immediate: true })

async function handleSubmit() {
  if (creating.value || !form.value.title.trim()) return
  const title = form.value.link.title.trim()
  const url = form.value.link.url.trim()
  error.value = ''
  if (!!title !== !!url) {
    showFirstLink.value = true
    error.value = copy.value.invalidLink
    return
  }
  if (url) {
    try { new URL(url) } catch {
      showFirstLink.value = true
      error.value = copy.value.invalidUrl
      return
    }
  }
  creating.value = true
  try {
    const result = await pageStore.createPage({
      title: form.value.title.trim(),
      brief: form.value.brief.trim(),
      collections: [{ links: title ? [{ title, url, tags: [], photo_url: '', sub_links: [] }] : [] }]
    })
    // Clear the dirty guard before the parent navigates to the newly created page.
    form.value = emptyForm()
    creating.value = false
    emit('update:show', false)
    emit('created', result.page_id)
  } catch (err) {
    error.value = err?.message || t('modal.creationFailed')
  } finally {
    creating.value = false
  }
}
</script>
