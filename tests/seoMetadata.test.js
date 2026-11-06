import test from 'node:test'
import assert from 'node:assert/strict'
import { pageSeo } from '../src/seo/site.js'

test('private and share pages retain the active UI language without public metadata', () => {
  for (const path of ['/my', '/page/private-fixture', '/share/access-fixture', '/auth/callback/google']) {
    const seo = pageSeo(path, 'zh-CN')
    assert.equal(seo.language, 'zh-CN', path)
    assert.equal(seo.robots, 'noindex, nofollow', path)
    assert.equal(seo.canonical, null, path)
    assert.deepEqual(seo.graph, [], path)
    assert.deepEqual(seo.alternates, [], path)
  }
})
