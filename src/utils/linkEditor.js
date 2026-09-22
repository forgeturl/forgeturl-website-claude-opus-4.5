import { stripCollectionsForSave } from './collections.js'

export const cloneLink = (link = {}) => ({
  ...JSON.parse(JSON.stringify(link)),
  title: link.title || '', url: link.url || '',
  tags: [...(link.tags || [])],
  sub_links: (link.sub_links || []).map(item => ({ ...item, _editorId: crypto.randomUUID() }))
})

export function linkPayload(form, tags) {
  const { __idx, ...rest } = form
  return {
    ...rest,
    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    sub_links: (form.sub_links || []).filter(item => item.sub_title || item.sub_url).map(({ _editorId, ...item }) => item)
  }
}

export function moveSubLink(items, from, to) {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return
  items.splice(to, 0, items.splice(from, 1)[0])
}

// Explicit link saves do not enter the retry queue: a failed edit remains only
// in the editor, so cancelling it cannot silently save it on a later edit.
export async function persistLinkEdit({ getPage, getCollections, collectionIndex, linkIndex, link, flush, save }) {
  const initialPageId = getPage()?.page_id
  const original = getCollections()[collectionIndex]?.links?.[linkIndex]
  if (!initialPageId || !original) throw new Error('Link is no longer available')
  const fingerprint = JSON.stringify(stripCollectionsForSave([{ links: [original] }]))
  await flush()
  const page = getPage()
  const collections = getCollections()
  const current = collections[collectionIndex]?.links?.[linkIndex]
  if (page?.page_id !== initialPageId || !current ||
      JSON.stringify(stripCollectionsForSave([{ links: [current] }])) !== fingerprint) {
    throw new Error('The page changed. Reopen the link before saving.')
  }
  const snapshot = stripCollectionsForSave(collections)
  snapshot[collectionIndex].links[linkIndex] = { ...link }
  await save({ page_id: page.page_id, title: page.title, brief: page.brief,
    collections: snapshot, version: page.version, mask: 7 })
  // Preserve local drag identities. Some stores also refresh collections on save.
  if (getPage()?.page_id === initialPageId) {
    const target = getCollections()[collectionIndex]?.links
    if (target?.[linkIndex]) target[linkIndex] = { ...link, __idx: target[linkIndex].__idx }
  }
}
