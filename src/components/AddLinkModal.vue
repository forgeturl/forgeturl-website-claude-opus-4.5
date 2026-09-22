<template>
  <EditDialog v-model:show="dialogOpen" :title="t('modal.addLink')" :description="lt('addEditor.description')" :dirty="dirty" :busy="busy" :error="error" :submit-label="submitLabel" :can-submit="canSubmit" width="820px" @submit="save" @discard="discardDraft" @closed="invalidateFileRead">
    <div class="add-link-editor">
      <div v-if="recovery" class="mb-5 rounded-xl bg-amber-50 p-4 text-sm dark:bg-amber-950/40" role="status">
        <p class="font-medium">{{ lt('addEditor.foundDraft') }}</p>
        <div class="mt-3 flex gap-4"><button type="button" class="font-medium text-violet-700 dark:text-violet-300" @click="restoreDraft">{{ lt('addEditor.restore') }}</button><button type="button" class="text-slate-500" @click="discardDraft">{{ lt('addEditor.discardDraft') }}</button></div>
      </div>
      <div v-if="savedNotice" class="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ savedNotice }}</div>
      <fieldset :disabled="Boolean(recovery)" class="min-w-0">
      <div class="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60" role="tablist" :aria-label="t('modal.addLink')">
        <button v-for="(tab, index) in tabs" :id="`add-link-tab-${tab.key}`" :key="tab.key" type="button" role="tab" :aria-selected="activeTab === tab.key" :aria-controls="`add-link-panel-${tab.key}`" :tabindex="activeTab === tab.key ? 0 : -1" class="flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition" :class="activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'" @click="activeTab = tab.key" @keydown="onTabKey($event, index)">
          <component :is="tab.icon" class="hidden size-4 sm:block" />{{ t(tab.label) }}<span v-if="hasData(tab.key)" class="size-1.5 shrink-0 rounded-full bg-violet-500" :aria-label="lt('addEditor.draft')" />
        </button>
      </div>

      <section v-show="activeTab === 'single'" id="add-link-panel-single" role="tabpanel" aria-labelledby="add-link-tab-single" class="space-y-3.5">
        <label class="editor-field"><span>{{ t('modal.url') }} <span class="text-violet-500">*</span></span><div class="flex min-w-0 gap-2"><input v-model="single.url" data-add-url type="text" inputmode="url" autocomplete="url" class="editor-control min-w-0 flex-1" :placeholder="t('modal.linkUrl')" @input="updateSuggestedTitle" /><button type="button" class="editor-secondary shrink-0 !px-3" :aria-label="lt('addEditor.paste')" :title="lt('addEditor.paste')" @click="pasteUrl"><ClipboardDocumentIcon class="size-4" /></button></div></label>
        <label class="editor-field"><span>{{ t('modal.title') }} <span class="font-normal text-slate-400">{{ lt('addEditor.optional') }}</span></span><input v-model="single.title" type="text" class="editor-control" :placeholder="t('modal.linkTitle')" @input="titleEdited = true" /></label>
        <div>
          <button type="button" class="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400" :aria-expanded="showTags" aria-controls="add-link-tags" @click="showTags = !showTags"><ChevronDownIcon class="size-4 transition-transform" :class="showTags ? 'rotate-180' : ''" />{{ t('modal.tags') }}<span v-if="tags" class="size-1.5 rounded-full bg-violet-500" /></button>
          <label v-if="showTags" id="add-link-tags" class="editor-field mt-3"><span class="sr-only">{{ t('modal.tags') }}</span><input v-model="tags" class="editor-control" :placeholder="t('modal.tagsPlaceholder')" /></label>
        </div>

        <section class="border-t border-slate-100 pt-3 dark:border-slate-700">
          <SubLinkTable ref="subLinksTable" v-model="single.sub_links" :disabled="busy || Boolean(recovery)" :reset-key="tableEpoch" />
        </section>
      </section>

      <section v-show="activeTab === 'batch'" id="add-link-panel-batch" role="tabpanel" aria-labelledby="add-link-tab-batch" class="space-y-4">
        <label class="editor-field"><span>{{ t('modal.pasteLinks') }}</span><textarea v-model="batchText" rows="5" class="editor-control resize-y leading-6" :placeholder="lt('addEditor.batchPlaceholder')" @input="parseBatch" /><span class="text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">{{ lt('addEditor.batchHint') }}</span></label>
        <div v-if="batchText.trim() && !batchLinks.length" class="rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" role="status">{{ lt('addEditor.noBatchLinks') }}</div>
        <div v-if="batchLinks.length">
          <div class="mb-3 flex items-center justify-between text-sm"><h3 class="font-semibold">{{ t('modal.parsedLinks') }} <span class="ml-1 text-slate-400">{{ batchLinks.length }}</span></h3><button type="button" class="text-slate-500 hover:text-red-600" @click="clearBatch">{{ t('modal.clearAll') }}</button></div>
          <div class="space-y-2"><div v-for="(link, index) in batchLinks" :key="link.url" class="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span class="w-5 shrink-0 text-center text-xs tabular-nums text-slate-400">{{ index + 1 }}</span><div class="min-w-0 flex-1"><input v-model="link.title" class="w-full rounded bg-transparent px-1 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-violet-400 dark:text-slate-100" :aria-label="`${t('modal.title')} ${index + 1}`" /><p class="mt-1 truncate px-1 text-xs text-slate-500 dark:text-slate-400" :title="link.url">{{ link.url }}</p></div><button type="button" class="add-icon-button hover:!text-red-500" :aria-label="`${lt('addEditor.remove')} ${link.title}`" @click="removeBatchLink(index)"><XMarkIcon /></button></div></div>
        </div>
      </section>

      <section v-show="activeTab === 'import'" id="add-link-panel-import" role="tabpanel" aria-labelledby="add-link-tab-import" class="space-y-4">
        <input ref="fileInput" type="file" accept=".html,.htm" class="sr-only" tabindex="-1" :aria-label="t('modal.selectBookmarksFile')" @change="selectFile" />
        <button type="button" class="w-full rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors" :class="dragOver ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-violet-300 dark:border-slate-600'" @click="fileInput?.click()" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="dropFile"><ArrowUpTrayIcon class="mx-auto mb-3 size-8 text-violet-500" /><span class="block text-sm font-semibold">{{ readingFile ? lt('addEditor.reading') : t('modal.clickToUpload') }}</span><span class="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{{ t('modal.orDragAndDrop') }} · HTML</span></button>
        <div v-if="fileName" class="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50"><DocumentTextIcon class="size-4 shrink-0 text-violet-500" /><span class="min-w-0 flex-1 truncate" :title="fileName">{{ fileName }}</span><button type="button" class="add-icon-button" :aria-label="t('modal.clear')" @click="clearImport"><XMarkIcon /></button></div>
        <div v-if="importFolders.length" class="space-y-2"><p class="mb-3 text-sm font-medium">{{ lt('addEditor.importSummary', { links: totalImportLinks, folders: importFolders.length }) }}</p><details v-for="(folder, index) in importFolders" :key="index" class="rounded-xl border border-slate-200 px-4 dark:border-slate-700" :open="index === 0"><summary class="cursor-pointer py-3 text-sm font-medium">{{ folder.title }} <span class="ml-2 font-normal text-slate-400">{{ folder.links.length }}</span></summary><div class="space-y-2 border-t border-slate-100 py-3 dark:border-slate-700"><p v-for="(link, linkIndex) in folder.links.slice(0, 8)" :key="linkIndex" class="truncate text-xs text-slate-500 dark:text-slate-400" :title="link.url">{{ link.title }}</p><p v-if="folder.links.length > 8" class="text-xs text-slate-400">{{ lt('addEditor.moreLinks', { count: folder.links.length - 8 }) }}</p></div></details></div>
        <p v-else class="text-xs leading-6 text-slate-500 dark:text-slate-400">{{ lt('addEditor.importHint') }}</p>
      </section>

      <section v-if="activeTab !== 'import'" class="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
        <label class="editor-field"><span class="flex items-center gap-2"><FolderIcon class="size-4 text-slate-400" />{{ t('modal.addToCollection') }}</span><select v-model="currentTarget" class="editor-control" :aria-label="t('modal.addToCollection')"><option v-for="(collection, index) in collections" :key="collection.__idx || index" :value="index">{{ collection.title || t('collection.unnamed') }}</option><option :value="-1">+ {{ t('modal.newFolder') }}</option></select></label>
        <label v-if="currentTarget === -1" class="editor-field mt-3"><span class="sr-only">{{ t('modal.enterNewFolderName') }}</span><input v-model="currentFolderName" class="editor-control" :placeholder="t('modal.enterNewFolderName')" /></label>
      </section>
      </fieldset>
    </div>
    <template #status><span>{{ saving ? lt('addEditor.saving') : dirty ? lt(draftSaved ? 'addEditor.draftSaved' : 'addEditor.unsaved') : lt('addEditor.safeHint') }}</span></template>
  </EditDialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpTrayIcon, ChevronDownIcon, ClipboardDocumentIcon, DocumentTextIcon, FolderIcon, LinkIcon, QueueListIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import EditDialog from './EditDialog.vue'
import SubLinkTable from './SubLinkTable.vue'
import { useAuthStore } from '@/stores/auth'
import { bookmarkFoldersFromDocument, newLinkPayload, parseBatchLinkText, suggestedLinkTitle } from '@/utils/addLink'

const props = defineProps({ show: Boolean, collections: { type: Array, default: () => [] }, onImportBookmarks: { type: Function, default: null }, draftScope: { type: String, default: '' } })
const emit = defineEmits(['update:show', 'add', 'batch-add'])
const { t } = useI18n({ useScope: 'global' })
const { t: lt } = useI18n({ useScope: 'local', fallbackLocale: 'en', messages: {
  'zh-CN': { addEditor: {
    description: '收好一个链接，也整理好与它相关的入口。', optional: '选填', paste: '从剪贴板粘贴', draft: '有未保存内容',
    remove: '移除',
    batchPlaceholder: '每行一个网址，或粘贴包含网址的文字\nhttps://example.com\nhttps://example.org', batchHint: '自动去重；添加前可以修改每条链接的标题。', noBatchLinks: '未识别到有效的 http 或 https 网址，请检查粘贴内容。',
    reading: '正在读取…', importSummary: '{folders} 个文件夹 · {links} 条链接', moreLinks: '还有 {count} 条链接', importHint: '在浏览器的书签管理器中导出 HTML 文件。导入前会展示文件夹和链接预览；嵌套文件夹会合并到上一级。',
    foundDraft: '这里有一份尚未添加的草稿。', restore: '恢复草稿', discardDraft: '丢弃草稿', draftSaved: '草稿已保留在此标签页', unsaved: '内容尚未保存', safeHint: '点击遮罩不会关闭编辑器', saving: '正在保存…',
    saveFailed: '保存失败，请重试。', subUrlRequired: '请填写子链接的网址，或删除这条子链接。', clipboardFailed: '无法读取剪贴板，请直接粘贴到网址输入框。',
    fileType: '请选择 HTML 格式的书签文件。', emptyImport: '文件中没有找到可导入的 http 或 https 书签。', fileFailed: '读取文件失败，请重新选择。',
    remainingDraft: '已保存。其他添加方式中还有未保存内容，已为你保留。', importUnavailable: '暂时无法导入，请稍后重试。'
  } },
  en: { addEditor: {
    description: 'Save a link and keep its related destinations together.', optional: 'optional', paste: 'Paste from clipboard', draft: 'Unsaved content',
    remove: 'Remove',
    batchPlaceholder: 'One URL per line, or paste text containing URLs\nhttps://example.com\nhttps://example.org', batchHint: 'Duplicates are removed. You can edit each title before adding.', noBatchLinks: 'No valid http or https URLs found. Check the pasted text.',
    reading: 'Reading file…', importSummary: '{folders} folders · {links} links', moreLinks: '{count} more links', importHint: 'Export an HTML file from your browser’s bookmark manager. Preview folders and links before importing. Nested folders are flattened into their parent.',
    foundDraft: 'An unfinished draft is available.', restore: 'Restore draft', discardDraft: 'Discard draft', draftSaved: 'Draft kept in this browser tab', unsaved: 'Changes not saved', safeHint: 'Clicking outside keeps this editor open', saving: 'Saving…',
    saveFailed: 'Could not save. Please try again.', subUrlRequired: 'Enter a URL for this sub-link or remove it.', clipboardFailed: 'Could not read clipboard. Paste directly into the URL field.',
    fileType: 'Choose an HTML bookmarks file.', emptyImport: 'No http or https bookmarks were found in this file.', fileFailed: 'Could not read this file. Please select it again.',
    remainingDraft: 'Saved. Your unsaved content in the other modes is still here.', importUnavailable: 'Import is unavailable. Please try again later.'
  } }
} })
const auth = useAuthStore()
const tabs = [{ key: 'single', label: 'modal.addLink', icon: LinkIcon }, { key: 'batch', label: 'modal.batchAdd', icon: QueueListIcon }, { key: 'import', label: 'modal.import', icon: ArrowUpTrayIcon }]
const freshLink = () => ({ title: '', url: '', sub_links: [] })
const dialogOpen = computed({ get: () => props.show, set: value => emit('update:show', value) })
const activeTab = ref('single')
const single = ref(freshLink())
const tags = ref('')
const showTags = ref(false)
const titleEdited = ref(false)
const target = ref(0)
const folderName = ref('')
const batchText = ref('')
const batchLinks = ref([])
const batchTarget = ref(0)
const batchFolderName = ref('')
const subLinksTable = ref(null)
const tableEpoch = ref(0)
const fileInput = ref(null)
const fileName = ref('')
const importFolders = ref([])
const dragOver = ref(false)
const readingFile = ref(false)
const saving = ref(false)
const error = ref('')
const savedNotice = ref('')
const draftSaved = ref(false)
const recovery = ref(null)
const draftKey = ref('')
let fileReadGeneration = 0
let initializing = false

const busy = computed(() => saving.value || readingFile.value)
const totalImportLinks = computed(() => importFolders.value.reduce((total, folder) => total + folder.links.length, 0))
const currentTarget = computed({ get: () => activeTab.value === 'single' ? target.value : batchTarget.value, set: value => { if (activeTab.value === 'single') target.value = value; else batchTarget.value = value } })
const currentFolderName = computed({ get: () => activeTab.value === 'single' ? folderName.value : batchFolderName.value, set: value => { if (activeTab.value === 'single') folderName.value = value; else batchFolderName.value = value } })
function hasData(mode) {
  if (mode === 'single') return Boolean(single.value.title || single.value.url || tags.value || folderName.value || single.value.sub_links.some(item => item.sub_title || item.sub_url))
  if (mode === 'batch') return Boolean(batchText.value || batchLinks.value.length || batchFolderName.value)
  return Boolean(fileName.value || importFolders.value.length)
}
const dirty = computed(() => tabs.some(tab => hasData(tab.key)))
const validTarget = computed(() => currentTarget.value === -1 ? Boolean(currentFolderName.value.trim()) : Boolean(props.collections[currentTarget.value]))
const canSubmit = computed(() => !busy.value && (activeTab.value === 'single' ? Boolean(single.value.url.trim()) && validTarget.value : activeTab.value === 'batch' ? batchLinks.value.length > 0 && validTarget.value : totalImportLinks.value > 0))
const submitLabel = computed(() => activeTab.value === 'single' ? t('modal.add') : activeTab.value === 'batch' ? t('modal.addNLinks', { count: batchLinks.value.length }) : t('modal.importNLinks', { count: totalImportLinks.value }))
const draft = computed(() => ({ activeTab: activeTab.value, single: single.value, tags: tags.value, titleEdited: titleEdited.value, target: target.value, folderName: folderName.value, batchText: batchText.value, batchLinks: batchLinks.value, batchTarget: batchTarget.value, batchFolderName: batchFolderName.value, fileName: fileName.value, importFolders: importFolders.value, collections: props.collections.map(item => item.title) }))

function defaultTarget() { return props.collections.length ? 0 : -1 }
function invalidateFileRead() { fileReadGeneration++; readingFile.value = false }
function clearSingle() { tableEpoch.value++; single.value = freshLink(); tags.value = ''; titleEdited.value = false; showTags.value = false; target.value = defaultTarget(); folderName.value = '' }
function clearBatch() { batchText.value = ''; batchLinks.value = [] }
function clearImport() { invalidateFileRead(); fileName.value = ''; importFolders.value = []; dragOver.value = false; if (fileInput.value) fileInput.value.value = '' }
function deleteStoredDraft() { try { if (draftKey.value) sessionStorage.removeItem(draftKey.value) } catch { /* storage may be disabled */ } draftSaved.value = false }
function discardDraft() { recovery.value = null; deleteStoredDraft() }
function keepDraft() {
  if (initializing || !props.show || !draftKey.value) return
  if (!dirty.value) { if (!recovery.value) deleteStoredDraft(); return }
  try { sessionStorage.setItem(draftKey.value, JSON.stringify(draft.value)); draftSaved.value = true } catch { draftSaved.value = false }
}
watch(draft, keepDraft, { deep: true, flush: 'sync' })
watch(() => props.show, open => {
  if (!open) { invalidateFileRead(); return }
  initializing = true
  clearSingle(); clearBatch(); clearImport(); batchTarget.value = defaultTarget(); batchFolderName.value = ''
  activeTab.value = 'single'; error.value = ''; savedNotice.value = ''; recovery.value = null; draftSaved.value = false
  draftKey.value = props.draftScope ? `forgeturl:add-draft:${JSON.stringify([auth.user?.uid || 'guest', props.draftScope])}` : ''
  try {
    const stored = JSON.parse(draftKey.value && sessionStorage.getItem(draftKey.value) || 'null')
    if (isValidDraft(stored)) recovery.value = stored
  } catch { /* invalid or unavailable storage */ }
  initializing = false
}, { immediate: true })
function isValidDraft(value) {
  return value && value.single && typeof value.single.title === 'string' && typeof value.single.url === 'string' && Array.isArray(value.single.sub_links) && value.single.sub_links.every(item => typeof item.sub_title === 'string' && typeof item.sub_url === 'string') && typeof value.tags === 'string' && typeof value.batchText === 'string' && Array.isArray(value.batchLinks) && value.batchLinks.every(item => typeof item.title === 'string' && typeof item.url === 'string') && Array.isArray(value.importFolders) && value.importFolders.every(folder => typeof folder.title === 'string' && Array.isArray(folder.links) && folder.links.every(link => typeof link.title === 'string' && typeof link.url === 'string'))
}
function restoreDraft() {
  const value = recovery.value
  if (!value) return
  initializing = true
  tableEpoch.value++
  single.value = { ...value.single, sub_links: value.single.sub_links.map(item => ({ ...item, _editorId: crypto.randomUUID() })) }
  tags.value = value.tags; showTags.value = Boolean(value.tags); titleEdited.value = Boolean(value.titleEdited)
  folderName.value = value.folderName || ''; batchFolderName.value = value.batchFolderName || ''; batchText.value = value.batchText; batchLinks.value = value.batchLinks; importFolders.value = value.importFolders; fileName.value = value.fileName || ''
  const sameCollections = JSON.stringify(value.collections) === JSON.stringify(props.collections.map(item => item.title))
  target.value = sameCollections && (value.target === -1 || props.collections[value.target]) ? value.target : defaultTarget()
  batchTarget.value = sameCollections && (value.batchTarget === -1 || props.collections[value.batchTarget]) ? value.batchTarget : defaultTarget()
  activeTab.value = tabs.some(tab => tab.key === value.activeTab) ? value.activeTab : 'single'
  recovery.value = null
  initializing = false; keepDraft()
}
function updateSuggestedTitle() { if (!titleEdited.value) single.value.title = single.value.url.trim() ? suggestedLinkTitle(single.value.url.trim()) : '' }
async function pasteUrl() {
  const previous = single.value.url
  const generation = fileReadGeneration
  try {
    const value = await navigator.clipboard.readText()
    if (props.show && !busy.value && generation === fileReadGeneration && single.value.url === previous) { single.value.url = value.trim(); updateSuggestedTitle(); error.value = '' }
  } catch { if (props.show && generation === fileReadGeneration) error.value = lt('addEditor.clipboardFailed') }
}
function parseBatch() { batchLinks.value = parseBatchLinkText(batchText.value, batchLinks.value) }
function removeBatchLink(index) { batchLinks.value.splice(index, 1); batchText.value = batchLinks.value.map(link => link.url).join('\n') }
async function onTabKey(event, index) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  activeTab.value = tabs[next].key
  await nextTick(); document.getElementById(`add-link-tab-${tabs[next].key}`)?.focus()
}
function selectFile(event) { const file = event.target.files?.[0]; event.target.value = ''; if (file) readFile(file) }
function dropFile(event) { dragOver.value = false; if (!busy.value && event.dataTransfer?.files?.[0]) readFile(event.dataTransfer.files[0]) }
async function readFile(file) {
  if (busy.value) return
  if (!/\.html?$/i.test(file.name)) { error.value = lt('addEditor.fileType'); return }
  const generation = ++fileReadGeneration
  readingFile.value = true; error.value = ''
  try {
    const html = await file.text()
    if (!props.show || generation !== fileReadGeneration) return
    const folders = bookmarkFoldersFromDocument(new DOMParser().parseFromString(html, 'text/html'), t('modal.importedFolder'))
    if (!folders.length) { error.value = lt('addEditor.emptyImport'); return }
    importFolders.value = folders; fileName.value = file.name
  } catch { if (generation === fileReadGeneration) error.value = lt('addEditor.fileFailed') }
  finally { if (generation === fileReadGeneration) readingFile.value = false }
}
function emitSave(event, payload) { return new Promise((resolve, reject) => emit(event, payload, failure => failure ? reject(failure) : resolve())) }
async function save() {
  if (!canSubmit.value || saving.value) return
  error.value = ''; savedNotice.value = ''
  const mode = activeTab.value
  if (mode === 'single') {
    const incomplete = single.value.sub_links.find(item => item.sub_title.trim() && !item.sub_url.trim())
    if (incomplete) { error.value = lt('addEditor.subUrlRequired'); await nextTick(); subLinksTable.value?.focusField(incomplete._editorId, 'sub_url'); return }
  }
  saving.value = true
  try {
    if (mode === 'single') await emitSave('add', { link: newLinkPayload(single.value, tags.value), collectionIndex: target.value, newCollectionName: target.value === -1 ? folderName.value.trim() : null })
    else if (mode === 'batch') await emitSave('batch-add', { links: batchLinks.value.map(link => newLinkPayload(link)), collectionIndex: batchTarget.value, newCollectionName: batchTarget.value === -1 ? batchFolderName.value.trim() : null })
    else {
      if (!props.onImportBookmarks) throw new Error(lt('addEditor.importUnavailable'))
      await props.onImportBookmarks({ folders: importFolders.value.map(folder => ({ title: folder.title, links: folder.links.map(link => newLinkPayload(link)) })) })
    }
    initializing = true
    if (mode === 'single') clearSingle()
    else if (mode === 'batch') { clearBatch(); batchFolderName.value = ''; batchTarget.value = defaultTarget() }
    else clearImport()
    recovery.value = null
    initializing = false
    if (dirty.value) { activeTab.value = tabs.find(tab => hasData(tab.key)).key; savedNotice.value = lt('addEditor.remainingDraft'); keepDraft() }
    else { deleteStoredDraft(); emit('update:show', false) }
  } catch (failure) { error.value = failure?.message || lt('addEditor.saveFailed') }
  finally { saving.value = false }
}
</script>

<style scoped>
.add-link-editor { min-width: 0; }
.add-link-editor :is(button, input, select, textarea):focus-visible { outline: 2px solid #8b5cf6; outline-offset: 2px; }
.add-icon-button { display: inline-flex; flex: 0 0 auto; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 8px; color: #64748b; }
.add-icon-button:hover { background: rgb(148 163 184 / 12%); }
.add-icon-button:disabled { opacity: .25; cursor: not-allowed; }
.add-icon-button svg { width: 16px; height: 16px; }
@media (max-width: 420px) { .add-icon-button { width: 28px; } }
</style>
