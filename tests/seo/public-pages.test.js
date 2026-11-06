import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const output = new URL('../../dist/', import.meta.url)
const read = path => {
  const file = new URL(path, output)
  assert.ok(existsSync(file), `Missing generated asset: ${path}`)
  return readFileSync(file, 'utf8').replace(/\sdata-seo-managed(?:="")?/g, '')
}

test('both homepages contain indexable product content without running JavaScript', () => {
  for (const [path, lang, phrase, canonical] of [
    ['index.html', 'en', 'bookmark manager', 'https://forgeturl.com/'],
    ['zh/index.html', 'zh-CN', '书签管理', 'https://forgeturl.com/zh/']
  ]) {
    const html = read(path)
    assert.match(html, new RegExp(`<html lang="${lang}"`))
    assert.match(html, /<h1[\s>]/)
    assert.ok(html.includes(phrase))
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`))
    assert.match(html, /<meta name="description" content="[^"]{40,}"/)
    assert.match(html, /<meta name="robots" content="index, follow/)
    assert.ok(html.includes('hreflang="en" href="https://forgeturl.com/"'))
    assert.ok(html.includes('hreflang="zh-CN" href="https://forgeturl.com/zh/"'))
    assert.match(html, /<a[^>]+href="\/zh\/"/)
    assert.match(html, /<a[^>]+href="\/"/)
    assert.match(html, /<summary[\s>]/)
    const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    assert.ok(scripts.length)
    const data = JSON.parse(scripts[0][1])
    assert.ok(data['@graph'].some(item => item['@type'] === 'WebSite'))
    assert.ok(data['@graph'].some(item => item['@type'] === 'SoftwareApplication'))
    assert.ok(!scripts[0][1].includes('aggregateRating'))
    assert.match(html, /property="og:image"/)
    assert.match(html, /name="twitter:card"/)
  }
})

test('legal and changelog pages have their own HTML, canonical and language', () => {
  for (const [path, heading] of [['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['changelog', 'Changelog']]) {
    const html = read(`${path}.html`)
    assert.ok(html.includes(heading))
    assert.match(html, /<h1[\s>]/)
    assert.match(html, /<html lang="en"/)
    assert.ok(html.includes(`<link rel="canonical" href="https://forgeturl.com/${path}">`))
  }
})

test('crawler resources are valid files and sitemap contains public pages only', () => {
  const robots = read('robots.txt')
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.match(robots, /Sitemap: https:\/\/forgeturl.com\/sitemap.xml/)
  assert.ok(!robots.includes('<html'))
  const sitemap = read('sitemap.xml')
  assert.match(sitemap, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/)
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.deepEqual(urls.sort(), ['https://forgeturl.com/', 'https://forgeturl.com/zh/', 'https://forgeturl.com/privacy', 'https://forgeturl.com/terms', 'https://forgeturl.com/changelog'].sort())
  assert.ok(!sitemap.includes('lastmod'), 'Do not manufacture freshness dates')
})

test('private and invalid routes use a noindex shell instead of the indexable homepage', () => {
  for (const path of ['app-shell.html', '404.html']) {
    const html = read(path)
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
    assert.ok(!html.includes('rel="canonical"'))
    assert.ok(!html.includes('application/ld+json'))
  }
})
