<template>
  <section ref="root" class="sublink-editor" :aria-label="t('title')">
    <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <h4 class="text-sm font-semibold sm:text-base">{{ t('title') }} <span class="ml-1 text-slate-500 dark:text-slate-400">({{ items.length }})</span></h4>
      <p class="order-3 w-full text-xs text-slate-500 dark:text-slate-400 sm:order-none sm:w-auto">{{ t('hint') }}</p>
      <button type="button" class="ml-auto flex items-center gap-1 rounded text-sm font-medium text-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40 dark:text-violet-300" :disabled="disabled" @click="add"><PlusIcon class="size-4" />{{ t('add') }}</button>
    </div>
    <div v-if="items.length" class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600">
      <table class="sublink-table w-full table-fixed border-collapse text-sm">
        <colgroup><col class="grip-column" /><col class="name-column" /><col /><col class="order-column" /><col class="delete-column" /></colgroup>
        <thead class="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/40 dark:text-slate-400"><tr><th><span class="sr-only">{{ t('drag') }}</span></th><th scope="col">{{ t('name') }}</th><th scope="col">{{ t('url') }}</th><th scope="col" class="!text-center">{{ t('order') }}</th><th scope="col" class="!text-center">{{ t('actions') }}</th></tr></thead>
        <draggable v-model="items" tag="tbody" item-key="_editorId" handle=".sublink-table-grip" :animation="160" :disabled="disabled" ghost-class="sublink-table-ghost" @end="announceOrder">
          <template #item="{ element: item, index }">
            <tr class="sublink-row">
              <td class="grip-cell"><span class="sublink-table-grip flex cursor-grab touch-none items-center justify-center text-slate-400 active:cursor-grabbing" :title="t('drag')" aria-hidden="true"><Bars3Icon class="size-4" /></span></td>
              <td class="name-cell"><input :value="item.sub_title" data-sublink-field="sub_title" :data-sublink-id="item._editorId" :data-sub-id="item._editorId" class="cell-input" :aria-label="t('nameAt', { index: index + 1 })" :placeholder="t('name')" :disabled="disabled" autocomplete="off" @input="updateField(item._editorId, 'sub_title', $event.target.value)" @focus="beginEdit" @keydown="onFieldKey($event, item._editorId, 'sub_title')" /></td>
              <td class="url-cell"><input :value="item.sub_url" data-sublink-field="sub_url" :data-sublink-id="item._editorId" class="cell-input" :aria-label="t('urlAt', { index: index + 1 })" :placeholder="t('urlPlaceholder')" :disabled="disabled" type="text" inputmode="url" autocomplete="off" spellcheck="false" @input="updateField(item._editorId, 'sub_url', $event.target.value)" @focus="beginEdit" @keydown="onFieldKey($event, item._editorId, 'sub_url')" /></td>
              <td class="order-cell"><div class="flex items-center justify-center gap-1"><button type="button" data-sublink-action @keydown="onActionKey($event, item._editorId)" class="table-icon order-icon" :aria-label="`${t('up')} ${item.sub_title || index + 1}`" :disabled="disabled || index === 0" @click="move(index, -1)"><ArrowUpIcon /></button><button type="button" data-sublink-action @keydown="onActionKey($event, item._editorId)" class="table-icon order-icon" :aria-label="`${t('down')} ${item.sub_title || index + 1}`" :disabled="disabled || index === items.length - 1" @click="move(index, 1)"><ArrowDownIcon /></button></div></td>
              <td class="delete-cell"><button type="button" data-sublink-action @keydown="onActionKey($event, item._editorId)" class="table-icon mx-auto hover:!text-red-600" :aria-label="`${t('remove')} ${item.sub_title || index + 1}`" :disabled="disabled" @click="remove(index)"><TrashIcon /></button></td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>
    <p v-else class="py-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ t('empty') }}</p>
    <p v-if="items.length" class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ t('keys') }}</p>
    <p v-if="removed" class="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400" role="status">{{ t('removed') }}<button type="button" class="rounded font-medium text-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40 dark:text-violet-300" :disabled="disabled" @click="undo">{{ t('undo') }}</button></p>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownIcon, ArrowUpIcon, Bars3Icon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import draggable from 'vuedraggable'
import { moveSubLink } from '@/utils/linkEditor'
const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean, resetKey: [String, Number, Boolean] })
const emit = defineEmits(['update:modelValue'])
const items = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const root = ref(null), removed = ref(null), announcement = ref('')
const beforeEdit = new WeakMap()
let actionOrigin = null
const { t } = useI18n({ useScope: 'local', fallbackLocale: 'en', messages: {
  'zh-CN': { title: '子链接', hint: '单击单元格编辑，Tab 连续填写', add: '添加子链接', name: '名称', url: '网址', urlPlaceholder: 'https://…', nameAt: '子链接名称 {index}', urlAt: '子链接网址 {index}', order: '排序', actions: '操作', keys: 'F2 操作当前行 · Esc 撤销当前单元格修改', drag: '拖动排序', up: '上移', down: '下移', remove: '删除子链接', removed: '已删除子链接', undo: '撤销', empty: '把测试环境、控制台等相关入口收在同一条链接下。', reordered: '子链接顺序已更新', reverted: '已撤销当前单元格的修改' },
  en: { title: 'Sub-links', hint: 'Click a cell to edit. Tab to the next field.', add: 'Add sub-link', name: 'Name', url: 'URL', urlPlaceholder: 'https://…', nameAt: 'Sub-link name {index}', urlAt: 'Sub-link URL {index}', order: 'Order', actions: 'Actions', keys: 'F2 for row actions · Esc to revert the current cell', drag: 'Drag to reorder', up: 'Move up', down: 'Move down', remove: 'Delete sub-link', removed: 'Sub-link deleted', undo: 'Undo', empty: 'Keep related environments and consoles under one link.', reordered: 'Sub-link order updated', reverted: 'Changes to this cell reverted' }
} })
watch(() => props.resetKey, () => { removed.value = null; announcement.value = '' })
function updateField(id, field, value) {
  if (props.disabled) return
  items.value = items.value.map(item => item._editorId === id ? { ...item, [field]: value } : item)
}
function beginEdit(event) { beforeEdit.set(event.target, event.target.value) }
function onFieldKey(event, id, field) {
  if (event.isComposing) return
  if (event.key === 'F2') {
    event.preventDefault(); event.stopPropagation(); actionOrigin = event.target
    event.target.closest('tr')?.querySelector('[data-sublink-action]:not(:disabled)')?.focus()
  } else if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); event.target.blur() }
  else if (event.key === 'Escape') {
    event.preventDefault(); event.stopPropagation()
    updateField(id, field, beforeEdit.get(event.target) ?? event.target.value)
    event.target.blur(); announcement.value = t('reverted')
  } else if (event.key === 'Tab') {
    const fields = [...root.value.querySelectorAll('[data-sublink-field]:not(:disabled)')]
    const next = fields[fields.indexOf(event.target) + (event.shiftKey ? -1 : 1)]
    if (next) { event.preventDefault(); next.focus() }
  }
}
function onActionKey(event, id) {
  if (!['F2', 'Escape'].includes(event.key)) return
  event.preventDefault(); event.stopPropagation()
  if (actionOrigin?.isConnected && actionOrigin.dataset.sublinkId === id) actionOrigin.focus()
  else focusField(id)
}
async function focusField(id, field = 'sub_title') {
  await nextTick()
  const input = [...(root.value?.querySelectorAll('[data-sublink-field]') || [])].find(el => el.dataset.sublinkId === id && el.dataset.sublinkField === field)
  input?.focus()
}
async function add() {
  if (props.disabled) return
  const item = { _editorId: crypto.randomUUID(), sub_title: '', sub_url: '' }
  items.value = [...items.value, item]; await focusField(item._editorId)
}
async function announceOrder() { await nextTick(); announcement.value = `${t('reordered')}: ${items.value.map(item => item.sub_title).join(', ')}` }
function move(index, offset) {
  if (props.disabled) return
  const next = [...items.value]; moveSubLink(next, index, index + offset); items.value = next; announceOrder()
}
function remove(index) {
  if (props.disabled) return
  removed.value = { item: items.value[index], index }
  const remaining = items.value.filter((_, i) => i !== index)
  items.value = remaining
  const next = remaining[Math.min(index, remaining.length - 1)]
  if (next) focusField(next._editorId)
  else nextTick(() => root.value?.querySelector('button')?.focus())
}
async function undo() {
  if (props.disabled || !removed.value) return
  const { item, index } = removed.value
  const next = [...items.value]; next.splice(Math.min(index, next.length), 0, item)
  items.value = next; removed.value = null; await focusField(item._editorId)
}
defineExpose({ focusField })
</script>

<style scoped>
.grip-column { width: 38px; }
.name-column { width: 150px; }
.order-column { width: 92px; }
.delete-column { width: 54px; }
.sublink-table th { height: 46px; padding: 8px 13px; font-size: 13px; font-weight: 600; }
.sublink-table :is(th, td) + :is(th, td) { border-left: 1px solid #e2e8f0; }
.sublink-row { border-top: 1px solid #e2e8f0; transition: background-color .15s; }
.sublink-row:focus-within { background: #f5f3ff; }
.sublink-table td { padding: 8px 6px; }
.cell-input { width: 100%; min-width: 0; height: 38px; padding: 7px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: inherit; outline: none; font-size: 14px; }
.cell-input:hover { background: rgb(148 163 184 / .07); }
.cell-input:focus { border-color: #8b5cf6; background: white; box-shadow: 0 0 0 1px #8b5cf6; }
.cell-input::placeholder { color: #94a3b8; }
.table-icon { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 7px; color: #64748b; transition: background-color .15s; }
.table-icon svg { width: 18px; height: 18px; }
.order-icon { border: 1px solid #e2e8f0; background: rgb(255 255 255 / .7); }
.table-icon:hover { background: #f1f5f9; }
.table-icon:focus-visible { outline: 2px solid #8b5cf6; outline-offset: 2px; }
.table-icon:disabled { opacity: .3; cursor: not-allowed; }
.sublink-table-ghost { opacity: .35; }
.dark .sublink-table :is(th, td), .dark .sublink-row, .dark .order-icon { border-color: #475569; }
.dark .sublink-row:focus-within { background: rgb(76 29 149 / .2); }
.dark .cell-input:focus { background: #1e293b; }
.dark .table-icon { color: #94a3b8; }
.dark .order-icon { background: #1e293b; }
.dark .table-icon:hover { background: #334155; }
@media (max-width: 639px) {
  .sublink-table, .sublink-table tbody { display: block; }
  .sublink-table colgroup, .sublink-table thead { display: none; }
  .sublink-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) 76px; padding: 6px 4px; }
  .sublink-row:first-child { border-top: 0; }
  .sublink-table td { display: block; padding: 3px; border-left: 0 !important; }
  .grip-cell { grid-column: 1; grid-row: 1 / 3; align-self: center; }
  .name-cell { grid-column: 2; grid-row: 1; }
  .url-cell { grid-column: 2; grid-row: 2; }
  .order-cell { grid-column: 3; grid-row: 1; align-self: center; }
  .delete-cell { grid-column: 3; grid-row: 2; align-self: center; }
  .cell-input { font-size: 16px; }
}
</style>
