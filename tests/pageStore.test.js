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

test('joining uses the share ID, preserves editors, and keeps uncached server entries', async () => {
  let joins = 0
  const state = createPageState({
    addSharedPage: async id => { assert.equal(id, 'Eshared'); joins++; return {
      page_brief: { page_id: id, title: 'Shared', is_self: false, page_conf: { can_edit: true } },
      page_ids: ['Oold', 'Rother', id], already_added: false
    } },
    getMySpace: async () => { throw new Error('offline') }
  })
  state.myPages.value = [page('Oold')]
  const original = state.myPages.value[0]
  state.currentPage.value = original
  await state.addSharedPage('Eshared')
  assert.equal(joins, 1)
  assert.deepEqual(state.myPages.value.map(p => p.page_id), ['Oold', 'Rother', 'Eshared'])
  assert.equal(state.myPages.value[0], original)
  assert.equal(state.currentPage.value, original)
  assert.equal(state.myPages.value[2].is_self, false)
})

test('failed join/removal leaves the previous space and selection untouched', async () => {
  const state = createPageState({ addSharedPage: async () => { throw new Error('offline') }, removeSharedPage: async () => { throw new Error('offline') } })
  state.myPages.value = [page('Eshared')]
  const original = state.myPages.value[0]
  state.currentPage.value = original
  await assert.rejects(state.addSharedPage('Rnew'), /offline/)
  await assert.rejects(state.removeSharedPage('Eshared'), /offline/)
  assert.equal(state.myPages.value[0], original)
  assert.equal(state.currentPage.value, original)
})

test('removing the last share accepts an empty space and invalidates pending hydration', async () => {
  const gate = deferred()
  const state = createPageState({ getPage: () => gate.promise, removeSharedPage: async () => ({ page_ids: [] }) })
  state.myPages.value = [page('Eshared')]
  state.currentPage.value = state.myPages.value[0]
  const read = state.fetchPage('Eshared')
  await state.removeSharedPage('Eshared')
  gate.resolve({ page: page('Eshared') })
  await assert.rejects(read)
  assert.deepEqual(state.myPages.value, [])
  assert.equal(state.currentPage.value, null)
})

test('revoked share clears both cached content and permissions and rejects a stale read', async () => {
  const gate = deferred()
  const state = createPageState({ getPage: () => gate.promise, getMySpace: async () => ({ page_briefs: [
    { page_id: 'Eshared', is_not_found: true, page_conf: {} }, { page_id: 'Oother', page_conf: { can_edit: true } }
  ] }) })
  state.myPages.value = [{ ...page('Eshared'), page_conf: { can_edit: true } }, page('Oother')]
  state.currentPage.value = { ...state.myPages.value[0] }
  const read = state.fetchPage('Eshared')
  await state.fetchMySpace()
  assert.equal(state.myPages.value[0].collections, undefined)
  assert.equal(state.currentPage.value.collections, undefined)
  assert.equal(state.currentPage.value.page_conf.can_edit, undefined)
  gate.resolve({ page: page('Eshared') })
  await assert.rejects(read)
  assert.equal(state.myPages.value[1].collections.length, 1)
})

test('membership writes are serialized and sorting sends its original space as a base', async () => {
  const gate = deferred(), called = []
  const state = createPageState({
    addSharedPage: async id => { called.push(id); if (id === 'Eone') await gate.promise; return { page_brief: { page_id: id }, page_ids: id === 'Eone' ? ['Oold', id] : ['Oold', 'Eone', id] } },
    savePageIds: async (ids, base) => { assert.deepEqual(base, ['Oold', 'Eone', 'Rtwo']); return { page_ids: ids } }
  })
  state.myPages.value = [page('Oold')]
  const one = state.addSharedPage('Eone'), two = state.addSharedPage('Rtwo')
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(called, ['Eone'])
  gate.resolve(); await Promise.all([one, two])
  await state.savePageOrder(['Rtwo', 'Oold', 'Eone'])
  assert.deepEqual(state.myPages.value.map(p => p.page_id), ['Rtwo', 'Oold', 'Eone'])
})

test('a missing share clears cached access, but transient network failures preserve content', async () => {
  let failure = new Error('offline')
  const state = createPageState({ getPage: async () => { throw failure } })
  state.myPages.value = [{ ...page('Eshared'), page_conf: { can_edit: true } }]
  await assert.rejects(state.fetchPage('Eshared'))
  assert.equal(state.myPages.value[0].collections.length, 1)
  failure = Object.assign(new Error('not found'), { code: 404 })
  await assert.rejects(state.fetchPage('Eshared'))
  assert.equal(state.myPages.value[0].collections, undefined)
  assert.equal(state.myPages.value[0].is_not_found, true)
})

test('a delayed successful save cannot restore content after access was revoked', async () => {
  const gate = deferred()
  const state = createPageState({ updatePage: () => gate.promise, getMySpace: async () => ({ page_briefs: [{ page_id: 'Eabc', is_not_found: true, page_conf: {} }] }) })
  state.myPages.value = [page('Eabc')]
  const saving = state.updatePage({ ...page('Eabc'), mask: 7 })
  await state.fetchMySpace()
  gate.resolve({ version: 1 }); await saving
  assert.equal(state.myPages.value[0].collections, undefined)
  assert.equal(state.myPages.value[0].page_conf.can_edit, undefined)
})

test('queued sorting uses the list visible when requested and cannot rejoin a removed entry', async () => {
  const gate = deferred()
  const state = createPageState({
    removeSharedPage: () => gate.promise,
    savePageIds: async (ids, base) => {
      assert.deepEqual(base, ['Oabc', 'Eabc'])
      throw new Error('space changed')
    }
  })
  state.myPages.value = [page('Oabc'), page('Eabc')]
  const removing = state.removeSharedPage('Eabc')
  const sorting = state.savePageOrder(['Eabc', 'Oabc'])
  gate.resolve({ page_ids: ['Oabc'] }); await removing
  await assert.rejects(sorting, /space changed/)
  assert.deepEqual(state.myPages.value.map(p => p.page_id), ['Oabc'])
})

test('save rejected by a revoked share invalidates cached access immediately', async () => {
  const state = createPageState({ updatePage: async () => { throw Object.assign(new Error('Not found'), { code: 404 }) } })
  state.myPages.value = [{ ...page('Eabc'), page_conf: { can_edit: true } }]
  await assert.rejects(state.updatePage({ ...page('Eabc'), mask: 7 }))
  assert.equal(state.myPages.value[0].is_not_found, true)
  assert.equal(state.myPages.value[0].collections, undefined)
  assert.equal(state.myPages.value[0].page_conf.can_edit, undefined)
})
