export function suggestedLinkTitle(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, '') || value
  } catch {
    return value
  }
}

function webUrlKey(value) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return null
    // Hosts are case-insensitive; paths, queries and fragments are not.
    return url.href
  } catch {
    return null
  }
}

export function parseBatchLinkText(input, previous = []) {
  const existing = new Map(previous.map(link => [webUrlKey(link.url), link]))
  const seen = new Set()
  return (input.match(/https?:\/\/[^\s<>"']+/gi) || []).flatMap(url => {
    const key = webUrlKey(url)
    if (!key || seen.has(key)) return []
    seen.add(key)
    return [{ ...existing.get(key), url, title: existing.get(key)?.title ?? suggestedLinkTitle(url) }]
  })
}

export function newLinkPayload(form, tags = '') {
  const url = form.url.trim()
  return {
    title: form.title.trim() || suggestedLinkTitle(url),
    url,
    tags: [...new Set(tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean))],
    photo_url: '',
    sub_links: (form.sub_links || [])
      .filter(item => item.sub_title.trim() || item.sub_url.trim())
      .map(item => ({ sub_title: item.sub_title.trim() || item.sub_url.trim(), sub_url: item.sub_url.trim() }))
  }
}

// Browser bookmark exports use a nested DL/DT structure. Preserve each first
// level folder separately (including duplicate names), flattening its children.
export function bookmarkFoldersFromDocument(doc, defaultTitle) {
  const main = doc.querySelector('dl')
  if (!main) return []
  const folders = []
  const loose = []
  const rootNames = new Set(['书签栏', 'Bookmarks Bar', 'Bookmarks bar', '其他书签', 'Other Bookmarks', 'Other bookmarks'])
  function walk(list, target = null) {
    for (const item of list.children) {
      if (item.tagName !== 'DT') continue
      const heading = item.querySelector(':scope > h3')
      const nested = item.querySelector(':scope > dl')
      const anchor = item.querySelector(':scope > a')
      if (heading && nested) {
        const title = heading.textContent.trim() || defaultTitle
        if (!target && (rootNames.has(title) || heading.hasAttribute('personal_toolbar_folder'))) {
          walk(nested)
        } else if (target) {
          walk(nested, target)
        } else {
          const folder = { title, links: [] }
          folders.push(folder)
          walk(nested, folder.links)
        }
      } else if (anchor) {
        const url = anchor.getAttribute('href')?.trim()
        if (!url || !webUrlKey(url)) continue
        const link = newLinkPayload({ title: anchor.textContent.trim(), url })
        ;(target || loose).push(link)
      }
    }
  }
  walk(main)
  if (loose.length) folders.push({ title: defaultTitle, links: loose })
  return folders.filter(folder => folder.links.length)
}
