// Run in a fresh playwright-cli session with a local Vite server.
// All API calls use fixtures; no real page or account is changed.
async (page) => {
  const origin = 'http://127.0.0.1:3000'
  page.setDefaultTimeout(6000)
  // Full-document navigation resets each fixture case after its save has been
  // asserted. It may briefly overlap an editor's unload-protection cleanup.
  page.removeAllListeners('dialog')
  page.on('dialog', dialog => dialog.accept())
  const check = (value, message) => { if (!value) throw new Error(message) }
  let saves = 0
  let collections = [{ title: 'Shared folder', links: [{ title: 'Example bookmark', url: 'https://example.com', tags: [], sub_links: [] }] }]
  await page.unrouteAll()
  await page.addInitScript(() => {
    localStorage.removeItem('x-token'); localStorage.removeItem('user-info')
    localStorage.setItem('locale', 'zh-CN')
  })
  const api = async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    const body = req.method() === 'POST' ? req.postDataJSON() || {} : {}
    let data = {}, code = 1
    if (req.method() !== 'OPTIONS') {
      if (path.endsWith('getPage')) {
        if (body.page_id === 'Egone') code = 404
        else data = { page: { page_id: body.page_id, title: 'Public shared content', brief: 'Browse without signing in',
          version: 1, collections, is_self: false, page_conf: { can_edit: body.page_id.startsWith('E'), read_only: body.page_id.startsWith('R'), can_delete: false } } }
      }
      else if (path.endsWith('getMySpace')) data = { page_briefs: [] }
      else if (path.endsWith('getUserInfo')) data = { uid: 42, username: 'Fixture' }
      else if (path.endsWith('updatePage')) { saves++; collections = body.collections; data = { version: 2 } }
      else if (path.endsWith('/users')) data = { count: 100 }
      else if (path.endsWith('/auth')) data = { auth_url: origin + '/auth/callback/google?code=fixture' }
      else if (path.includes('/callback/')) data = { uid: 42, username: 'Fixture', display_name: 'Fixture' }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ code, data, msg: code === 404 ? 'Share unavailable' : '' }) })
  }
  await page.route('**/space/**', api); await page.route('**/login/**', api); await page.route('**/stats/**', api)
  const completed = []
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    const path = '/share/Eabc?from=friend'
    await page.goto(origin + path)
    await page.getByRole('heading', { name: 'Public shared content', exact: true }).waitFor()
    await page.getByRole('link', { name: 'Example bookmark', exact: true }).waitFor()
    check(await page.getByRole('button', { name: '添加链接', exact: true }).count() === 0, 'guest acquired editing controls')
    check(await page.locator('.link-drag-handle').count() === 0, 'guest can drag and change content')
    check(await page.getByRole('button', { name: '复制此合集', exact: true }).count() === 0, 'guest can duplicate content')
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile header overflows')
    const before = saves
    await page.getByRole('button', { name: '登录后编辑', exact: true }).click()
    await page.waitForURL(url => url.pathname === '/' && url.searchParams.get('redirect') === path)
    check(saves === before, 'requesting login changed the page')
    await page.getByRole('button', { name: /Google/ }).first().click()
    await page.waitForURL(origin + path)
    await page.getByRole('button', { name: '添加链接', exact: true }).first().click()
    const editor = page.getByRole('dialog', { name: '添加链接' })
    await editor.locator('[data-add-url]').fill(`https://edited-${viewport.width}.example`)
    await editor.getByRole('button', { name: '添加', exact: true }).click()
    await editor.waitFor({ state: 'hidden' })
    check(saves === before + 1, 'authenticated editor did not save')
    completed.push(`${viewport.width}px: anonymous browse, edit login, full return URL, authenticated add`)
  }
  await page.goto(origin + '/share/Rabc')
  await page.getByRole('heading', { name: 'Public shared content', exact: true }).waitFor()
  check(await page.getByRole('button', { name: '登录后编辑', exact: true }).count() === 0, 'readonly link offered edit access')
  check(await page.getByRole('button', { name: '添加链接', exact: true }).count() === 0, 'readonly link is editable')
  completed.push('readonly share stays public and readonly')
  await page.goto(origin + '/share/Egone')
  await page.getByText('Share unavailable', { exact: true }).waitFor()
  check(await page.getByRole('button', { name: '登录后编辑', exact: true }).count() === 0, 'revoked share offered editing')
  completed.push('revoked edit share stays inaccessible')
  return completed
}
