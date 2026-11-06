// Run against the built site served by `wrangler dev --local --port 8787`.
// Network fixtures prevent changes to real accounts and analytics traffic.
async (page) => {
  const origin = 'http://127.0.0.1:8787'
  const check = (condition, message) => { if (!condition) throw new Error(message) }
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/www.googletagmanager.com/**', route => route.abort())
  await page.route('**/google-analytics.com/**', route => route.abort())
  await page.route('http://127.0.0.1/**', async route => {
    const url = new URL(route.request().url())
    if (url.port === '8787') return route.continue()
    let data = {}
    if (url.pathname.includes('/stats/users')) data = { count: 0 }
    if (url.pathname.includes('getMySpace')) data = { page_briefs: [] }
    if (url.pathname.includes('getUserInfo')) data = { uid: 'seo-fixture', username: 'SEO fixture' }
    if (url.pathname.includes('getPage')) data = { page: { page_id: 'seo-fixture', title: 'SEO fixture shared page', brief: '', version: 1, page_conf: { read_only: true, can_edit: false }, collections: [] } }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }, body: JSON.stringify({ code: 1, data }) })
  })
  await page.goto(origin)
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('locale', 'zh-CN') })
  await page.reload()
  await page.getByRole('heading', { level: 1 }).filter({ hasText: 'Online bookmark manager' }).waitFor()
  check(await page.locator('html').getAttribute('lang') === 'en', 'English URL followed stored Chinese preference')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.getByRole('button', { name: /简体中文/ }).click()
  await page.waitForURL(origin + '/zh/')
  await page.getByRole('heading', { level: 1 }).filter({ hasText: '在线书签管理工具' }).waitFor()
  check(await page.locator('link[rel=canonical]').getAttribute('href') === 'https://forgeturl.com/zh/', 'Chinese canonical is wrong')
  check(await page.locator('meta[name=description]').count() === 1, 'Duplicate descriptions')
  await page.reload()
  await page.getByRole('heading', { level: 1 }).filter({ hasText: '在线书签管理工具' }).waitFor()
  await page.getByRole('button', { name: '中', exact: true }).click()
  await page.getByRole('button', { name: /日本語/ }).click()
  await page.waitForURL(origin + '/?lang=ja')
  check(await page.locator('html').getAttribute('lang') === 'ja', 'Existing Japanese option no longer works')
  check((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), 'Unpublished UI language should not be indexed')
  await page.reload()
  check(await page.locator('html').getAttribute('lang') === 'ja', 'Japanese choice was lost on reload')
  await page.getByRole('link', { name: 'ForgetURL Beta', exact: true }).click()
  check(new URL(page.url()).searchParams.get('lang') === 'ja', 'Home navigation erased Japanese choice')
  check(await page.locator('html').getAttribute('lang') === 'ja', 'Home navigation changed UI language')
  await page.goto(origin + '/zh/')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('heading', { level: 1 }).filter({ hasText: '在线书签管理工具' }).waitFor()
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile page overflows')
  await page.locator('summary').first().click()
  check(await page.locator('details').first().getAttribute('open') !== null, 'FAQ cannot be expanded')
  await page.screenshot({ path: 'output/playwright/seo-mobile.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(origin)
  await page.evaluate(() => {
    localStorage.setItem('x-token', JSON.stringify('seo-fixture-token'))
    localStorage.setItem('user-info', JSON.stringify({ uid: 'seo-fixture', username: 'SEO fixture' }))
  })
  await page.reload()
  await page.locator('a[href="/my"]').first().click()
  await page.waitForURL(origin + '/my')
  check((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), 'Workspace retained indexable metadata')
  check(await page.locator('link[rel=canonical]').count() === 0, 'Workspace retained homepage canonical')
  check(await page.locator('script[type="application/ld+json"]').count() === 0, 'Workspace retained public schema')
  await page.goto(origin + '/share/seo-fixture')
  await page.getByRole('heading', { name: 'SEO fixture shared page', exact: true }).waitFor()
  check((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), 'Share page is indexable')
  await page.goto(origin + '/seo-fixture-page-does-not-exist')
  await page.getByRole('heading', { name: /Page not found/ }).waitFor()
  check((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), '404 page is indexable')
  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false })
  try {
    const reader = await noJs.newPage()
    for (const [path, text] of [['/', 'Online bookmark manager'], ['/zh/', '在线书签管理工具']]) {
      await reader.goto(origin + path)
      check((await reader.locator('h1').innerText()).includes(text), `Missing no-JS heading on ${path}`)
      check(await reader.locator('details').count() === 6, `Missing no-JS FAQ on ${path}`)
    }
  } finally { await noJs.close() }
  check(errors.length === 0, errors.join('\n'))
  return { passed: ['English URL overrides stored preference', 'Chinese switch and reload', 'Japanese UI retained', '390px layout and FAQ', 'SPA metadata cleanup in workspace', 'shared page remains noindex', '404 view', 'both languages readable without JS'], pageErrors: errors }
}
