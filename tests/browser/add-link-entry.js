// Run with a local Vite server and Playwright CLI's run-code command.
// All API calls are intercepted; no real account or server data is modified.
async (page) => {
  const origin = 'http://127.0.0.1:3000'
  const check = (condition, message) => { if (!condition) throw new Error(message) }
  let saved
  await page.unrouteAll()
  await page.addInitScript(() => {
    localStorage.setItem('x-token', JSON.stringify('fixture-token'))
    localStorage.setItem('user-info', JSON.stringify({ uid: 'fixture', username: 'fixture' }))
  })
  await page.route('**/space/**', async route => {
    const url = route.request().url()
    let data = {}
    if (url.includes('getPage')) data = { page: {
      page_id: 'fixture', title: 'Test page', brief: '', version: 1, is_self: true,
      page_conf: { can_edit: true }, collections: [
        { title: 'Partner', links: [] }, { title: 'Other', links: [] }
      ]
    } }
    else if (url.includes('getMySpace')) data = { page_briefs: [{ page_id: 'fixture', title: 'Test page' }] }
    else if (url.includes('getUserInfo')) data = { uid: 'fixture', username: 'fixture' }
    else if (url.includes('updatePage') && route.request().method() === 'POST') {
      saved = route.request().postDataJSON()
      data = { version: 2 }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }, body: JSON.stringify({ code: 1, data }) })
  })
  const completed = []
  for (const path of ['/my', '/page/fixture']) {
    for (const mode of ['single', 'batch', 'import']) {
      saved = null
      await page.goto(origin + path)
      const heading = page.getByRole('heading', { name: 'Other', exact: true })
      await heading.waitFor()
      const card = page.locator('.group').filter({ has: heading })
      await card.getByRole('button', { name: '添加链接' }).click()
      const dialog = page.getByRole('dialog', { name: '添加链接' })
      await dialog.getByRole('heading', { name: '添加链接' }).waitFor({ state: 'visible', timeout: 3000 })
      const target = dialog.getByRole('combobox', { name: '加入合集' })
      check(await target.isDisabled(), `${path} ${mode}: target is not locked`)
      check(await target.locator('option:checked').textContent() === 'Other', `${path} ${mode}: wrong target`)
      if (mode === 'single') await dialog.locator('[data-add-url]').fill('https://new.example')
      if (mode === 'batch') {
        await dialog.getByRole('tab', { name: '批量添加' }).click()
        await dialog.locator('textarea').fill('https://new.example')
      }
      if (mode === 'import') {
        await dialog.getByRole('tab', { name: '导入', exact: true }).click()
        await dialog.locator('input[type=file]').setInputFiles({ name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from('<DL><DT><A HREF="https://new.example">New</A></DT></DL>') })
      }
      await dialog.getByRole('button', { name: mode === 'single' ? '添加' : mode === 'batch' ? '添加 1 条链接' : '导入 1 条链接', exact: true }).click()
      await dialog.getByRole('heading', { name: '添加链接' }).waitFor({ state: 'hidden', timeout: 5000 })
      check(saved?.collections[0].links.length === 0, `${path} ${mode}: wrong folder was changed`)
      check(saved?.collections[1].links[0]?.url === 'https://new.example', `${path} ${mode}: link was not saved to target`)
      completed.push(`${path} ${mode}`)
    }
    await page.getByRole('button', { name: '添加链接' }).first().click()
    const dialog = page.getByRole('dialog', { name: '添加链接' })
    await dialog.getByRole('heading', { name: '添加链接' }).waitFor({ state: 'visible' })
    check(await dialog.getByRole('combobox', { name: '加入合集' }).isEnabled(), `${path}: global target should be editable`)
    await dialog.getByRole('button', { name: '取消' }).click()
    completed.push(`${path} global`)
  }
  return completed
}
