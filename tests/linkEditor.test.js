import assert from 'node:assert/strict'
import test from 'node:test'
import { cloneLink, linkPayload, moveSubLink, persistLinkEdit } from '../src/utils/linkEditor.js'

test('reorder preserves values and metadata, strips editor-only identity', () => {
  const source = { title: 'parent', url: 'https://example.com', photo_url: 'photo', sub_links: [{ sub_title: 'a', sub_url: 'https://a.com', extra: 7 }, { sub_title: 'b', sub_url: 'https://b.com' }] }
  const draft = cloneLink(source)
  moveSubLink(draft.sub_links, 1, 0)
  moveSubLink(draft.sub_links, 0, -1)
  const result = linkPayload(draft, ' dev, ops, ')
  assert.deepEqual(result.sub_links.map(x => x.sub_title), ['b', 'a'])
  assert.equal(result.sub_links[1].extra, 7)
  assert.equal(result.photo_url, 'photo')
  assert.equal('_editorId' in result.sub_links[0], false)
  assert.deepEqual(result.tags, ['dev', 'ops'])
  assert.equal(source.sub_links[0].sub_title, 'a')
})

function fixture(save, flush = async () => {}) {
  const page = { page_id: 'p1', version: 1, title: 'Page' }
  const collections = [{ __idx: 'c1', links: [{ title: 'old', url: 'https://example.com', __idx: 'l1' }] }]
  const link = { title: 'new', url: 'https://example.com', tags: [], sub_links: [] }
  return { page, collections, options: { getPage: () => page, getCollections: () => collections, collectionIndex: 0, linkIndex: 0, link, flush, save } }
}

test('failed explicit save leaves page unchanged and rejects for editor retry', async () => {
  const { options, collections } = fixture(async () => { throw new Error('offline') })
  await assert.rejects(persistLinkEdit(options), /offline/)
  assert.equal(collections[0].links[0].title, 'old')
})

test('waits for pending page saves, uses refreshed version, commits only after response', async () => {
  let release
  const gate = new Promise(resolve => { release = resolve })
  let sent
  const f = fixture(async payload => { sent = payload; await gate }, async () => { f.page.version = 9 })
  const promise = persistLinkEdit(f.options)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(f.collections[0].links[0].title, 'old')
  assert.equal(sent.version, 9)
  assert.equal(sent.collections[0].links[0].title, 'new')
  assert.equal('__idx' in sent.collections[0].links[0], false)
  release(); await promise
  assert.equal(f.collections[0].links[0].title, 'new')
  assert.equal(f.collections[0].links[0].__idx, 'l1')
})

test('refuses to write to a different page or changed link after pending saves finish', async () => {
  let writes = 0
  const f = fixture(async () => { writes++ }, async () => { f.page.page_id = 'p2' })
  await assert.rejects(persistLinkEdit(f.options), /page changed/)
  assert.equal(writes, 0)
  const g = fixture(async () => { writes++ }, async () => { g.collections[0].links[0].title = 'remote change' })
  await assert.rejects(persistLinkEdit(g.options), /page changed/)
  assert.equal(writes, 0)
})
