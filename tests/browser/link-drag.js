// Run with a local Vite server and Playwright's run-code command.
// API requests are intercepted; only fixture data is changed.
async (page) => {
  const origin = 'http://127.0.0.1:3000'
  const check = (condition, message) => { if (!condition) throw new Error(message) }
  const link = title => ({ title, url: `https://example.com/${title}` })
  const initialPage = () => ({
    page_id: 'drag-fixture', title: 'Drag fixture', brief: '', version: 1,
    is_self: true, page_conf: { can_edit: true }, collections: [
      { title: 'sbs集群', links: [link('old-partner-socket'), link('GC-SunmiSocket-partner-socket'), link('message-core')] },
      { title: 'middle集群服务', links: [link('open-platform'), link('device-manage')] },
      { title: 'Empty', links: [] }
    ]
  })
  let fixture
  let saves
  await page.unrouteAll()
  await page.setViewportSize({ width: 1260, height: 900 })
  await page.addInitScript(() => {
    localStorage.setItem('x-token', JSON.stringify('fixture-token'))
    localStorage.setItem('user-info', JSON.stringify({ uid: 'fixture', username: 'fixture' }))
  })
  await page.route('**/space/**', async route => {
    const request = route.request()
    const url = request.url()
    let data = {}
    if (request.method() !== 'OPTIONS') {
      if (url.includes('getPage')) data = { page: fixture }
      else if (url.includes('getMySpace')) data = { page_briefs: [{ page_id: fixture.page_id, title: fixture.title }] }
      else if (url.includes('getUserInfo')) data = { uid: 'fixture', username: 'fixture' }
      else if (url.includes('updatePage')) {
        const payload = request.postDataJSON()
        saves.push(payload)
        fixture = { ...fixture, ...payload, version: fixture.version + 1 }
        data = { version: fixture.version }
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }, body: JSON.stringify({ code: 1, data }) })
  })
  const card = index => page.locator('.links-draggable').nth(index).locator('..')
  const titles = async index => page.locator('.links-draggable').nth(index).locator('a').allTextContents()
  const completed = []
  const failures = []
  for (const path of ['/my', '/page/drag-fixture']) {
    for (const mode of ['bottom', 'edge', 'heading', 'heading-after-hover', 'empty', 'sort', 'cancel']) {
      fixture = initialPage()
      saves = []
      try {
        await page.goto(origin + path)
        await page.getByRole('heading', { name: 'middle集群服务', exact: true }).waitFor()
        const source = page.locator('.links-draggable').first().locator(':scope > div')
          .filter({ hasText: 'message-core' }).locator('.link-drag-handle')
        const start = await source.boundingBox()
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
        await page.mouse.down()
        await page.mouse.move(start.x + start.width / 2 + 8, start.y + start.height / 2, { steps: 5 })
        await page.locator('.link-drop-indicator').waitFor({ state: 'attached' })
        const targetIndex = mode === 'empty' ? 2 : mode === 'sort' ? 0 : 1
        const target = await card(targetIndex).boundingBox()
        let x = target.x + target.width / 2
        let y = target.y + target.height - 25
        if (mode === 'edge') { x = target.x + target.width - 6; y = target.y + target.height - 6 }
        if (mode.startsWith('heading') || mode === 'cancel') y = target.y + 20
        if (mode === 'sort') {
          const first = await page.locator('.links-draggable').first().locator(':scope > div').first().boundingBox()
          x = first.x + 2; y = first.y + first.height / 2
        }
        if (mode === 'cancel') {
          // Stay outside the lists, so Escape only tests the card-drop fallback.
          const sourceCard = await card(0).boundingBox()
          await page.mouse.move(sourceCard.x - 12, start.y + start.height / 2, { steps: 8 })
          await page.mouse.move(sourceCard.x - 12, y, { steps: 8 })
        }
        if (mode === 'heading-after-hover') {
          const first = await page.locator('.links-draggable').nth(1).locator(':scope > div').first().boundingBox()
          await page.mouse.move(first.x + 2, first.y + first.height / 2, { steps: 16 })
          await page.mouse.move(first.x + 2, y, { steps: 8 })
        }
        await page.mouse.move(x, y, { steps: 24 })
        if (mode === 'empty') {
          // Crossing the populated middle list can change this grid row's height.
          const empty = await card(targetIndex).boundingBox()
          await page.mouse.move(empty.x + empty.width / 2, empty.y + empty.height - 25, { steps: 8 })
        }
        if (mode === 'cancel') await page.keyboard.press('Escape')
        const savedResponse = mode === 'cancel' ? null : page.waitForResponse(
          response => response.url().includes('updatePage') && response.request().method() === 'POST',
          { timeout: 2000 }
        ).catch(() => null)
        await page.mouse.up()
        if (mode === 'cancel') {
          check(JSON.stringify(await titles(0)) === JSON.stringify(['old-partner-socket', 'GC-SunmiSocket-partner-socket', 'message-core']), 'cancel: source changed')
          check(JSON.stringify(await titles(1)) === JSON.stringify(['open-platform', 'device-manage']), 'cancel: target changed')
          check(saves.length === 0, 'cancel: save was triggered')
          completed.push(`${path} ${mode}`)
          continue
        }
        const expectedTarget = mode === 'empty' ? ['message-core']
          : mode === 'sort' ? ['message-core', 'old-partner-socket', 'GC-SunmiSocket-partner-socket']
            : ['open-platform', 'device-manage', 'message-core']
        await page.waitForFunction(({ index, expected }) => {
          const lists = document.querySelectorAll('.links-draggable')
          const actual = [...lists[index].querySelectorAll('a')].map(a => a.textContent.trim())
          return JSON.stringify(actual) === JSON.stringify(expected)
        }, { index: targetIndex, expected: expectedTarget }, { timeout: 2000 })
        check(await savedResponse, `${mode}: no save response`)
        check(saves.length > 0, `${mode}: no save request`)
        const saved = saves.at(-1)
        check(JSON.stringify(saved.collections[targetIndex].links.map(link => link.title)) === JSON.stringify(expectedTarget), `${mode}: wrong saved order`)
        check(saved.collections.flatMap(collection => collection.links).filter(link => link.title === 'message-core').length === 1, `${mode}: link duplicated or lost`)
        check(!JSON.stringify(saved).includes('__idx'), `${mode}: client IDs leaked into save`)
        if (mode !== 'sort') check(JSON.stringify(await titles(0)) === JSON.stringify(['old-partner-socket', 'GC-SunmiSocket-partner-socket']), `${mode}: source still contains moved link`)
        await page.reload()
        await page.getByRole('heading', { name: 'middle集群服务', exact: true }).waitFor()
        check(JSON.stringify(await titles(targetIndex)) === JSON.stringify(expectedTarget), `${mode}: move did not survive reload`)
        completed.push(`${path} ${mode}`)
      } catch (error) {
        await page.mouse.up()
        failures.push(`${path} ${mode}: ${error.message}`)
      }
    }
  }
  check(failures.length === 0, JSON.stringify({ completed, failures }))
  return completed
}
