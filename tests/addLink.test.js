import assert from 'node:assert/strict'
import test from 'node:test'
import { newLinkPayload, parseBatchLinkText } from '../src/utils/addLink.js'

test('batch deduplicates hosts without collapsing case-sensitive URL paths', () => {
  const links = parseBatchLinkText('https://EXAMPLE.com/A https://example.com/A https://example.com/a https://example.com/?q=A https://example.com/?q=a')
  assert.equal(links.length, 4)
  assert.deepEqual(links.map(link => link.url), ['https://EXAMPLE.com/A', 'https://example.com/a', 'https://example.com/?q=A', 'https://example.com/?q=a'])
})

test('editing batch input preserves user-edited titles and ignores invalid URLs', () => {
  const initial = parseBatchLinkText('https://example.com/A')
  initial[0].title = 'My custom title'
  const updated = parseBatchLinkText('https://EXAMPLE.com/A\nhttps://second.example/path\nhttps://', initial)
  assert.equal(updated.length, 2)
  assert.equal(updated[0].title, 'My custom title')
  assert.equal(updated[1].title, 'second.example')
  assert.deepEqual(parseBatchLinkText('no links', updated), [])
})

test('new links preserve internal and custom URL formats and sublink order', () => {
  const payload = newLinkPayload({ title: ' Tools ', url: ' intranet/team ', sub_links: [
    { _editorId: 'one', sub_title: 'SSH', sub_url: ' ssh://host/path ' },
    { _editorId: 'two', sub_title: '', sub_url: ' app://project/open ' },
    { _editorId: 'empty', sub_title: '', sub_url: '' }
  ] }, ' dev，ops, dev ')
  assert.equal(payload.url, 'intranet/team')
  assert.deepEqual(payload.tags, ['dev', 'ops'])
  assert.deepEqual(payload.sub_links, [{ sub_title: 'SSH', sub_url: 'ssh://host/path' }, { sub_title: 'app://project/open', sub_url: 'app://project/open' }])
})
