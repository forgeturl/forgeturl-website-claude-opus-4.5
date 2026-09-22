import assert from 'node:assert/strict'
import test from 'node:test'
import { createPageState } from '../src/utils/pageState.js'

const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const page = (page_id, title = page_id) => ({ page_id, title, brief: '', version: 0,
  collections: [{ title: 'Folder', links: [{ title: 'Bookmark', url: 'https://example.com' }] }] })

test('brief refresh keeps loaded content and object identity for the selected editor', async () => {
  const state = createPageState({ getMySpace: async () => ({ page_briefs: [
    { page_id: 'A', title: 'Renamed', page_conf: { can_edit: true } }
  ] }) })
  state.myPages.value = [page('A')]
  const original = state.myPages.value[0]
  await state.fetchMySpace()
  assert.equal(state.myPages.value[0], original)
  assert.equal(original.title, 'Renamed')
  assert.equal(original.version, 0)
  assert.equal(original.collections[0].links.length, 1)
})

test('late page response returns its own data without changing the latest page', async () => {
  const a = deferred(), b = deferred()
  const state = createPageState({ getPage: id => id === 'A' ? a.promise : b.promise })
  const first = state.fetchPage('A')
  const second = state.fetchPage('B')
  b.resolve({ page: page('B') })
  assert.equal((await second).page_id, 'B')
  assert.equal(state.currentPage.value.page_id, 'B')
  assert.equal(state.loading.value, true)
  a.resolve({ page: page('A') })
  assert.equal((await first).page_id, 'A')
  assert.equal(state.currentPage.value.page_id, 'B')
  assert.equal(state.loading.value, false)
})

test('deleting another page does not cancel the requested page hydration', async () => {
  const gate = deferred()
  const state = createPageState({ getPage: () => gate.promise, deletePage: async () => ({}) })
  state.myPages.value = [page('A'), page('B'), page('C')]
  state.currentPage.value = state.myPages.value[2]
  const pending = state.fetchPage('A')
  await state.deletePage('B')
  gate.resolve({ page: page('A', 'Loaded A') })
  await pending
  assert.equal(state.currentPage.value.page_id, 'A')
  assert.equal(state.currentPage.value.title, 'Loaded A')
  assert.deepEqual(state.myPages.value.map(item => item.page_id), ['A', 'C'])
})

test('deleting the requested page invalidates its delayed hydration', async () => {
  const gate = deferred()
  const state = createPageState({ getPage: () => gate.promise, deletePage: async () => ({}) })
  state.myPages.value = [page('A'), page('B')]
  state.currentPage.value = state.myPages.value[0]
  const pending = state.fetchPage('A')
  await state.deletePage('A')
  gate.resolve({ page: page('A', 'Deleted A') })
  await pending
  assert.equal(state.currentPage.value, null)
  assert.deepEqual(state.myPages.value.map(item => item.page_id), ['B'])
})

test('successful create/delete do not depend on an unavailable sidebar refresh', async () => {
  let refreshes = 0, creates = 0
  const state = createPageState({
    getMySpace: async () => { refreshes++; throw new Error('offline') },
    createPage: async () => { creates++; return { page_id: 'new', version: 0, page_ids: ['new', 'old'] } },
    deletePage: async () => ({})
  })
  state.myPages.value = [page('old')]
  const existing = state.myPages.value[0]
  const input = { title: 'New', brief: 'Description', collections: page('new').collections }
  const result = await state.createPage(input)
  assert.equal(result.page_id, 'new')
  assert.equal(creates, 1)
  assert.equal(refreshes, 0)
  assert.equal(state.myPages.value[0].version, 0)
  assert.equal(state.myPages.value[0].page_conf.can_edit, true)
  assert.equal(state.myPages.value[1], existing)
  input.collections.length = 0
  assert.equal(state.myPages.value[0].collections.length, 1)
  state.currentPage.value = state.myPages.value[0]
  await state.deletePage('new')
  assert.equal(state.currentPage.value, null)
  assert.deepEqual(state.myPages.value.map(p => p.page_id), ['old'])
  assert.equal(state.myPages.value[0].collections.length, 1)
  assert.equal(refreshes, 0)
})

test('sharing patches the requested page and preserves buffers, selection, and version', async () => {
  const gate = deferred()
  const state = createPageState({
    addPageLink: () => gate.promise,
    removePageLink: async () => ({})
  })
  state.myPages.value = [page('A'), page('B')]
  const original = state.myPages.value[0]
  const collections = original.collections
  state.currentPage.value = original
  const pending = state.addPageLink('A', 'readonly')
  state.currentPage.value = state.myPages.value[1]
  original.collections[0].title = 'Pending edit'
  gate.resolve({ new_page_id: 'RA', page_type: 'readonly' })
  await pending
  assert.equal(state.currentPage.value.page_id, 'B')
  assert.equal(state.myPages.value[0], original)
  assert.equal(original.collections, collections)
  assert.equal(original.collections[0].title, 'Pending edit')
  assert.equal(original.version, 0)
  assert.equal(original.readonly_page_id, 'RA')
  await state.removePageLink('A', 'readonly')
  assert.equal(original.readonly_page_id, '')
})

test('a read started before saving cannot restore old content or version', async () => {
  const gate = deferred()
  const state = createPageState({ getPage: () => gate.promise, updatePage: async () => ({ version: 0 }) })
  state.myPages.value = [page('A')]
  const pendingRead = state.fetchPage('A')
  await state.updatePage({ page_id: 'A', title: 'Saved title', brief: '',
    version: 0, mask: 7, collections: [{ title: 'Saved folder', links: [] }] })
  gate.resolve({ page: page('A', 'Old title') })
  const result = await pendingRead
  assert.equal(result.version, 1)
  assert.equal(result.title, 'Saved title')
  assert.equal(result.collections[0].title, 'Saved folder')
  assert.equal(state.currentPage.value.title, 'Saved title')
})

test('saving does not revert title typed after the request started', async () => {
  const gate = deferred()
  const state = createPageState({ updatePage: () => gate.promise })
  state.myPages.value = [page('A', 'First title')]
  const pending = state.updatePage({ ...page('A', 'First title'), mask: 7 })
  state.myPages.value[0].title = 'Second title'
  gate.resolve({ version: 1 })
  await pending
  assert.equal(state.myPages.value[0].title, 'Second title')
  assert.equal(state.myPages.value[0].version, 1)
})

test('logout clears state and ignores previously started reads', async () => {
  const pageGate = deferred(), spaceGate = deferred()
  const state = createPageState({ getPage: () => pageGate.promise, getMySpace: () => spaceGate.promise })
  const first = state.fetchPage('A'), second = state.fetchMySpace()
  state.clear()
  pageGate.resolve({ page: page('A') }); spaceGate.resolve({ page_briefs: [page('A')] })
  await Promise.all([first, second])
  assert.equal(state.currentPage.value, null)
  assert.deepEqual(state.myPages.value, [])
})

test('move updates both page caches once even if their old collection arrays were shared', async () => {
  const state = createPageState({ getPage: async () => page('B'), transferCollection: async () => ({ source_version: 1, target_version: 1 }) })
  const source = page('A')
  source.collections.push({ title: 'Remaining', links: [] })
  state.myPages.value = [source, page('B')]
  state.currentPage.value = { ...source }
  await state.transferCollection({ sourcePageId: 'A', targetPageId: 'B', sourceCollectionIndex: 0, operation: 'move', sourceVersion: 0 })
  assert.deepEqual(state.currentPage.value.collections.map(c => c.title), ['Remaining'])
  assert.deepEqual(state.myPages.value[0].collections.map(c => c.title), ['Remaining'])
  assert.equal(state.myPages.value[1].collections.length, 2)
})
