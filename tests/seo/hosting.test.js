import test from 'node:test'
import assert from 'node:assert/strict'

const origin = process.env.FORGETURL_PREVIEW_ORIGIN || 'http://127.0.0.1:8787'
const get = async path => {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(25000) })
  return { response, body: await response.text() }
}

test('public pages return indexable HTML with the expected canonical', async () => {
  for (const path of ['/', '/zh/', '/privacy', '/terms', '/changelog']) {
    const { response, body } = await get(path)
    assert.equal(response.status, 200, path)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'), path)
    assert.match(body, /<h1[\s>]/)
    assert.ok(body.includes(`href="https://forgeturl.com${path}"`))
  }
})

test('private, edit, share and OAuth URLs are noindex before JavaScript runs', async () => {
  for (const path of ['/my', '/my/', '/page/seo-fixture', '/share/seo-fixture?token=fake', '/auth/callback/google?code=fake', '/login']) {
    const { response, body } = await get(path)
    assert.equal(response.status, 200, path)
    assert.match(response.headers.get('x-robots-tag') || '', /noindex/)
    assert.match(body, /name="robots" content="noindex, nofollow"/)
    assert.ok(!body.includes('rel="canonical"'), path)
    assert.ok(!body.includes('application/ld+json'), path)
  }
})

test('unknown paths return 404 with noindex instead of the homepage', async () => {
  const { response, body } = await get('/seo-fixture-page-does-not-exist')
  assert.equal(response.status, 404)
  assert.match(body, /Page not found/)
  assert.match(body, /name="robots" content="noindex, nofollow"/)
})

test('robots and sitemap use the correct content types', async () => {
  const robots = await get('/robots.txt')
  assert.equal(robots.response.status, 200)
  assert.match(robots.response.headers.get('content-type'), /text\/plain/)
  assert.match(robots.body, /Sitemap: https:\/\/forgeturl.com\/sitemap.xml/)
  const sitemap = await get('/sitemap.xml')
  assert.equal(sitemap.response.status, 200)
  assert.match(sitemap.response.headers.get('content-type'), /(?:application|text)\/xml/)
  assert.match(sitemap.body, /<urlset /)
  assert.ok(!/\/share\/|\/page\/|\/my|\/auth\//.test(sitemap.body))
})

test('social preview image is a real PNG', async () => {
  const response = await fetch(origin + '/social-card.png', { signal: AbortSignal.timeout(25000) })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /image\/png/)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(bytes.readUInt32BE(16), 1200)
  assert.equal(bytes.readUInt32BE(20), 630)
})
