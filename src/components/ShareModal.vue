<template>
  <EditDialog :show="show" :title="t('modal.sharePage')" :description="page.title" :show-cancel="false" :busy="busy" :error="error" :submit-label="t('modal.close')" width="600px" @update:show="$emit('update:show', $event)" @submit="$emit('update:show', false)">
    <section v-for="item in modes" :key="item.type" class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <button type="button" class="flex w-full items-center gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" :aria-expanded="expanded === item.type" @click="expanded = expanded === item.type ? '' : item.type">
        <component :is="item.icon" class="size-5 shrink-0 text-violet-500" /><div class="min-w-0 flex-1"><h4 class="text-sm font-semibold">{{ t(item.title) }}</h4><p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ t(item.description) }}</p></div><span v-if="page[item.field]" class="text-xs text-emerald-600 dark:text-emerald-400">{{ local('enabled') }}</span><ChevronUpIcon v-if="expanded === item.type" class="size-4" /><ChevronDownIcon v-else class="size-4" />
      </button>
      <div v-if="expanded === item.type" class="space-y-3 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/20">
        <template v-if="page[item.field]">
          <label class="editor-field"><span class="sr-only">{{ t(item.title) }}</span><input class="editor-control" :value="getShareUrl(page[item.field])" readonly @focus="$event.target.select()" /></label>
          <div v-if="revokeType !== item.type" class="flex flex-wrap items-center gap-2"><button type="button" class="editor-secondary" @click="copyLink(item.type, page[item.field])"><CheckIcon v-if="copiedType === item.type" class="size-4 text-emerald-600" /><ClipboardDocumentIcon v-else class="size-4" />{{ copiedType === item.type ? local('copied') : t('modal.copy') }}</button><button type="button" class="ml-auto rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" @click="revokeType = item.type">{{ local('revoke') }}</button></div>
          <div v-else class="space-y-2"><p class="text-sm text-slate-600 dark:text-slate-300">{{ local('revokeHint') }}</p><div class="flex justify-end gap-2"><button type="button" class="editor-secondary" @click="revokeType = ''">{{ t('modal.cancel') }}</button><button type="button" class="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50" @click="removeLink(item.type)">{{ local('confirmRevoke') }}</button></div></div>
        </template>
        <button v-else type="button" class="editor-primary" @click="generateLink(item.type)"><LinkIcon class="size-4" />{{ t(item.generate) }}</button>
      </div>
    </section>
  </EditDialog>
</template>
<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { EyeIcon, PencilSquareIcon, ShieldCheckIcon, ChevronUpIcon, ChevronDownIcon, ClipboardDocumentIcon, CheckIcon, LinkIcon } from '@heroicons/vue/24/outline'
import EditDialog from './EditDialog.vue'
import { usePageStore } from '@/stores/page'
const props = defineProps({ show:Boolean, page:{type:Object,required:true}, beforeAction:Function })
defineEmits(['update:show'])
const { t } = useI18n()
const { t: local } = useI18n({ useScope:'local', fallbackLocale:'en', messages:{ 'zh-CN':{enabled:'已开启',copied:'已复制',revoke:'停用链接',revokeHint:'停用后，持有此链接的人将无法再通过它访问页面。',confirmRevoke:'确认停用'}, en:{enabled:'Active',copied:'Copied',revoke:'Disable link',revokeHint:'People with this link will no longer be able to access the page through it.',confirmRevoke:'Disable link'} } })
const modes = [
  {type:'readonly',field:'readonly_page_id',title:'modal.readOnlyLink',description:'modal.readOnlyDesc',generate:'modal.generateReadOnly',icon:EyeIcon},
  {type:'edit',field:'edit_page_id',title:'modal.editLink',description:'modal.editLinkDesc',generate:'modal.generateEditLink',icon:PencilSquareIcon},
  {type:'admin',field:'admin_page_id',title:'modal.superLink',description:'modal.superLinkDesc',generate:'modal.generateSuperLink',icon:ShieldCheckIcon}
]
const pageStore = usePageStore(), busy = ref(false), error = ref(''), expanded = ref('readonly'), copiedType = ref(''), revokeType = ref('')
let copiedTimer
watch(() => props.show, open => { if (open) { error.value=''; copiedType.value=''; revokeType.value=''; expanded.value='readonly' } })
const getShareUrl = id => `${window.location.origin}/share/${id}`
async function act(action) {
  if (busy.value) return
  busy.value=true; error.value=''
  try { await props.beforeAction?.(); await action(); revokeType.value='' } catch (err) { error.value=err.message || t('modal.failedToGenerate') } finally { busy.value=false }
}
const generateLink = type => act(() => pageStore.addPageLink(props.page.page_id,type))
const removeLink = type => act(() => pageStore.removePageLink(props.page.page_id,type))
async function copyLink(type,id) {
  error.value=''
  try {
    await navigator.clipboard.writeText(getShareUrl(id))
    copiedType.value=type; clearTimeout(copiedTimer); copiedTimer=setTimeout(() => {copiedType.value=''},2000)
  } catch (err) { error.value=err.message || 'Copy failed. Select the link and copy it manually.' }
}
onUnmounted(() => clearTimeout(copiedTimer))
</script>
