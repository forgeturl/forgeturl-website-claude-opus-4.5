// playwright-cli --session forgeturl-shared run-code --filename tests/browser/shared-space.js
// Uses only local fixtures. No account or production data is modified.
async (page) => {
  const origin = 'http://127.0.0.1:3000'
  page.setDefaultTimeout(7000)
  page.removeAllListeners("dialog")
  page.on("dialog", dialog => dialog.accept())
  const check = (value, message) => { if (!value) throw new Error(message) }
  const completed = []
  let ids = ['Oown'], revoked = false, failJoin = true, joinCount = 0, saves = 0, failRemove = false
  const original = { title: 'Shared original', brief: 'Same page for A and B', version: 1,
    collections: [{ title: 'Shared folder', links: [] }] }
  const buildPage = id => ({ ...JSON.parse(JSON.stringify(original)), page_id: id,
    title: id === 'Oown' ? 'Existing own page' : id === 'Eself' ? 'My shared page' : original.title,
    is_self: ['Oown', 'Oself', 'Eself'].includes(id), owner_page_id: id === 'Eself' ? 'Oself' : '',
    page_conf: id.startsWith('R') ? { read_only: true, can_edit: false, can_delete: false } : { can_edit: true, can_delete: id.startsWith('O') },
    create_time: 100, update_time: 200 })
  const brief = id => revoked && ['Eabc', 'Rabc'].includes(id)
    ? { page_id: id, is_not_found: true, page_conf: {}, is_self: false }
    : (({ collections, version, ...rest }) => rest)(buildPage(id))
  await page.evaluate(() => sessionStorage.removeItem("fixture-guest"))
  await page.unrouteAll()
  await page.addInitScript(() => {
    localStorage.setItem('locale', 'zh-CN')
    if (!sessionStorage.getItem('fixture-guest')) {
      localStorage.setItem('x-token', JSON.stringify('fixture-token'))
      localStorage.setItem('user-info', JSON.stringify({ uid: 42, username: 'B' }))
    }
  })
  const api = async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    if (req.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: headers() }); return }
    const body = req.method() === 'POST' ? req.postDataJSON() || {} : {}
    let data = {}, code = 1, msg = ''
    if (path.endsWith('getUserInfo')) data = { uid: 42, username: 'B' }
    else if (path.endsWith('getMySpace')) data = { space_name: 'B space', page_briefs: ids.map(brief) }
    else if (path.endsWith('getPage')) {
      if (revoked && ['Eabc', 'Rabc'].includes(body.page_id)) { code = 404; msg = 'Not found' }
      else data = { page: buildPage(body.page_id) }
    } else if (path.endsWith('addSharedPage')) {
      joinCount++
      await new Promise(resolve => setTimeout(resolve, 180))
      if (failJoin) { failJoin = false; code = 500; msg = '模拟加入失败，请重试' }
      else {
        const already = ids.includes(body.page_id)
        if (!already) ids.push(body.page_id)
        data = { page_brief: brief(body.page_id), page_ids: [...ids], already_added: already }
      }
    } else if (path.endsWith('removeSharedPage')) {
      if (failRemove) { failRemove = false; code = 500; msg = '模拟移除失败，请重试' }
      else { ids = ids.filter(id => id !== body.page_id); data = { page_ids: [...ids] } }
    } else if (path.endsWith('updatePage')) {
      check(!body.page_id.startsWith('R'), 'readonly share attempted to save')
      saves++; original.collections = body.collections; original.title = body.title; original.version++
      data = { version: original.version, update_time: 300 }
    } else if (path.includes('/callback/')) data = { uid: 42, username: 'B', display_name: 'B' }
    else if (path.endsWith('/auth')) data = { auth_url: origin + '/auth/callback/google?code=fixture&state=fixture' }
    else if (path.endsWith('/users')) data = { count: 100 }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: headers(), body: JSON.stringify({ code, data, msg }) })
  }
  function headers() { return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } }
  await page.route('**/space/**', api)
  await page.route('**/login/**', api)
  await page.route('**/stats/**', api)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(origin + '/share/Eabc')
  const join = page.getByRole('button', { name: '加入我的空间', exact: true })
  await join.click()
  await page.getByText('模拟加入失败，请重试', { exact: true }).waitFor()
  check(ids.length === 1, 'failed join modified space')
  await join.click()
  check(await page.getByRole('button', { name: '正在加入…', exact: true }).isDisabled(), 'join is not disabled while submitting')
  await page.getByText('已加入我的空间', { exact: true }).waitFor()
  check(joinCount === 2 && ids.join() === 'Oown,Eabc', 'retry did not append exactly once')
  completed.push('desktop join failure/retry/loading/order')
  await page.getByRole('button', { name: '在我的空间打开', exact: true }).click()
  await page.waitForURL(origin + '/my?page_id=Eabc')
  await page.getByRole('heading', { name: /^Shared original/ }).waitFor()
  check(page.url().endsWith('/my?page_id=Eabc'), 'space did not select shared page')
  await page.getByText('共享 · 可编辑', { exact: true }).last().waitFor()
  await page.getByRole('button', { name: '添加链接', exact: true }).first().click()
  const editor = page.getByRole('dialog', { name: '添加链接' })
  await editor.locator('[data-add-url]').fill('https://b-edited.example')
  await editor.getByRole('button', { name: '添加', exact: true }).click()
  await editor.waitFor({ state: 'hidden' })
  check(saves === 1, 'editing through space did not save')
  await page.goto(origin + '/share/Eabc')
  await page.getByRole('link', { name: /b-edited/ }).first().waitFor()
  await page.getByText('已加入我的空间', { exact: true }).waitFor()
  check(joinCount === 2 && ids.length === 2, 'refresh rejoined or duplicated membership')
  original.collections[0].links.push({ title: 'Owner update', url: 'https://a-edited.example', tags: [], sub_links: [] })
  await page.reload()
  await page.getByText('Owner update', { exact: true }).waitFor()
  completed.push('space editor changes original; reload sees owner updates; membership persists')

  await page.goto(origin + '/share/Rabc')
  await page.getByRole('button', { name: '加入我的空间', exact: true }).click()
  await page.getByText('已加入我的空间', { exact: true }).waitFor()
  await page.getByRole('button', { name: '在我的空间打开', exact: true }).click()
  await page.getByText('共享 · 只读', { exact: true }).last().waitFor()
  await page.getByRole('heading', { name: /^Shared original/ }).waitFor()
  check(await page.getByRole('button', { name: '添加链接', exact: true }).count() === 0, 'readonly entry acquired edit controls')
  completed.push('readonly join retains permissions; R/E remain separate entries')

  // A failed remove retains state. A successful remove affects only this entry.
  failRemove = true
  await page.getByRole('button', { name: '从我的空间移除', exact: true }).last().click()
  await page.getByRole('dialog').getByRole('button', { name: '从我的空间移除', exact: true }).click()
  await page.getByText('模拟移除失败，请重试', { exact: true }).waitFor()
  check(ids.includes('Rabc'), 'failed removal changed membership')
  await page.getByRole('dialog').getByRole('button').last().click()
  await page.getByRole('button', { name: '从我的空间移除', exact: true }).last().click()
  await page.getByRole('dialog').getByRole('button', { name: '从我的空间移除', exact: true }).click()
  await page.waitForFunction(() => !document.querySelector('[role=dialog]'))
  check(ids.join() === 'Oown,Eabc', 'remove changed other entries')
  await page.goto(origin + '/share/Rabc')
  await page.getByRole('button', { name: '加入我的空间', exact: true }).click()
  await page.getByText('已加入我的空间', { exact: true }).waitFor()
  check(ids.join() === 'Oown,Eabc,Rabc', 'rejoin did not append')
  completed.push('remove failure preserves state; remove/rejoin keeps other pages')

  revoked = true
  await page.goto(origin + '/my?page_id=Eabc')
  await page.getByRole('alert').getByText('分享已失效', { exact: true }).waitFor()
  check(await page.getByRole('heading', { name: 'Shared folder', exact: true }).count() === 0, 'revoked content still rendered')
  check(await page.getByRole('button', { name: '添加链接', exact: true }).count() === 0, 'revoked share is editable')
  await page.getByRole('button', { name: 'Existing own page', exact: true }).click()
  await page.getByRole('heading', { name: /^Existing own page/ }).waitFor()
  completed.push('revoked share placeholder; other pages still load')

  revoked = false; ids = []
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(origin + '/share/Eabc')
  await page.getByRole('button', { name: '加入我的空间', exact: true }).click()
  await page.getByText('已加入我的空间', { exact: true }).waitFor()
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile share header overflows')
  await page.getByRole('button', { name: '在我的空间打开', exact: true }).click()
  await page.getByRole('heading', { name: /^Shared original/ }).waitFor()
  // Mobile navigation's menu button is the first icon button in the header.
  await page.locator('header button').first().click()
  await page.getByRole('button', { name: '从我的空间移除', exact: true }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: '从我的空间移除', exact: true }).click()
  await page.getByRole('heading', { name: '暂无页面', exact: true }).waitFor()
  check(ids.length === 0, 'last share could not be removed')
  completed.push('mobile open/remove and empty space; no horizontal overflow')

  ids = ['Oself']
  await page.goto(origin + '/share/Eself')
  await page.getByRole('button', { name: '在我的空间打开', exact: true }).click()
  await page.waitForURL(origin + '/my?page_id=Oself')
  check(page.url().endsWith('/my?page_id=Oself'), 'owner shortcut did not use owner entry')
  completed.push('own share opens existing owner entry')

  // Exercise the real login UI/callback with a mocked OAuth provider.
  await page.evaluate(() => { sessionStorage.setItem('fixture-guest', '1'); localStorage.removeItem('x-token'); localStorage.removeItem('user-info') })
  await page.goto(origin + '/share/Rabc?from=friend')
  await page.getByRole('button', { name: '登录后加入', exact: true }).click()
  await page.waitForURL(url => url.pathname === '/' && url.searchParams.has('redirect'))
  check(new URL(page.url()).searchParams.get('redirect') === '/share/Rabc?from=friend', 'login lost share return path')
  const google = page.getByRole('button', { name: /Google/ }).first()
  await google.click()
  await page.waitForURL(origin + '/share/Rabc?from=friend')
  await page.getByRole('button', { name: '加入我的空间', exact: true }).waitFor()
  completed.push('guest login and OAuth callback preserve full share URL')
  return completed
}
