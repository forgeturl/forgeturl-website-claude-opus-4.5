// Local mock API regression for failed initialization and delayed page removal.
async (page) => {
  const origin = 'http://127.0.0.1:3000'
  page.setDefaultTimeout(7000)
  const check = (value, message) => { if (!value) throw new Error(message) }
  let ids = ['Oown', 'Eabc'], failSpace = true, delayRead = false, releaseRead, readStarted
  let signalRead
  const completed = []
  const full = id => ({ page_id: id, title: id === 'Oown' ? 'Existing page' : 'Race shared page', brief: '', version: 1,
    is_self: id === 'Oown', page_conf: { can_edit: true, can_delete: id === 'Oown' },
    collections: [{ title: 'First', links: [{ title: 'Draft link', url: 'https://draft.example', tags: [], sub_links: [] }] }, { title: 'Second', links: [] }] })
  await page.unrouteAll()
  await page.addInitScript(() => {
    sessionStorage.removeItem('fixture-guest')
    localStorage.setItem('locale', 'zh-CN')
    localStorage.setItem('x-token', JSON.stringify('fixture-token'))
    localStorage.setItem('user-info', JSON.stringify({ uid: 42, username: 'B' }))
  })
  let revoked = false
  await page.route('**/space/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    let data = {}, code = 1, msg = ''
    if (req.method() !== 'OPTIONS') {
      const body = req.postDataJSON() || {}
      if (path.endsWith('getUserInfo')) data = { uid: 42, username: 'B' }
      if (path.endsWith('getMySpace')) {
        if (failSpace) { failSpace = false; code = 500; msg = '模拟空间加载失败' }
        else data = { page_briefs: ids.map(id => { const { collections, ...brief } = full(id); return brief }) }
      }
      if (path.endsWith('getPage')) {
        if (delayRead && body.page_id === 'Eabc') { signalRead?.(); await new Promise(resolve => { releaseRead = resolve }) }
        data = { page: full(body.page_id) }
      }
      if (path.endsWith('removeSharedPage')) { ids = ids.filter(id => id !== body.page_id); data = { page_ids: ids } }
      if (path.endsWith('updatePage')) { if (revoked) { code = 404; msg = 'Not found' } else data = { version: 2 } }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }, body: JSON.stringify({ code, data, msg }) })
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(origin + '/my')
  await page.getByText('模拟空间加载失败', { exact: true }).waitFor()
  await page.getByRole('button', { name: '重试', exact: true }).click()
  await page.getByRole('heading', { name: /^Existing page/ }).waitFor()
  completed.push('initial space failure retries the summary successfully')

  delayRead = true; readStarted = new Promise(resolve => { signalRead = resolve })
  const shared = page.getByRole('complementary').getByRole('button', { name: 'Race shared page', exact: true })
  await shared.click(); await readStarted
  await shared.locator('..').getByRole('button', { name: '从我的空间移除', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: '从我的空间移除', exact: true }).click()
  await page.getByRole('heading', { name: /^Existing page/ }).waitFor()
  releaseRead(); delayRead = false
  check(ids.join() === 'Oown', 'remove changed the wrong membership')
  check(await shared.count() === 0, 'delayed hydration restored removed shortcut')
  completed.push('removing loading share clears spinner; late response cannot restore it')

  // Drag a real bookmark to create an autosave snapshot, then revoke its link.
  ids = ['Oown', 'Eabc']
  await page.goto(origin + '/my?page_id=Eabc')
  await page.getByRole('heading', { name: /^Race shared page/ }).waitFor()
  revoked = true
  const source = page.locator('.links-draggable').first().locator('.link-drag-handle').first()
  const start = await source.boundingBox()
  const target = await page.locator('.links-draggable').nth(1).boundingBox()
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(start.x + start.width / 2 + 8, start.y + start.height / 2, { steps: 5 })
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 20 })
  await page.mouse.up()
  await page.getByRole('alert').getByText('分享已失效', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Existing page', exact: true }).click()
  await page.getByRole('heading', { name: /^Existing page/ }).waitFor()
  await page.getByRole('button', { name: '下载未保存内容', exact: true }).waitFor()
  const retained = await page.evaluate(() => JSON.parse(sessionStorage.getItem('unavailable-shared-drafts:42')))
  check(retained.Eabc.collections.some(c => c.links.some(l => l.url === 'https://draft.example')), 'revoked unsaved bookmark was lost')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载未保存内容', exact: true }).click()
  check((await download).suggestedFilename() === 'ForgetURL-unsaved-shared-pages.json', 'draft is not downloadable')
  completed.push('revoked pending save retains downloadable full draft and permits other pages')
  return completed
}
