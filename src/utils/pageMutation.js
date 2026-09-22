import { stripCollectionsForSave } from './collections.js'

/** Save a complete immutable snapshot before exposing an explicit form edit. */
export async function persistPageMutation({ getPage, getCollections, commit, flush, save, mutate }) {
  const pageId = getPage()?.page_id
  if (!pageId) throw new Error('Page is unavailable')
  await flush()
  const page = getPage()
  if (page?.page_id !== pageId || !Array.isArray(page.collections)) {
    throw new Error('Wait for the page to load before editing')
  }
  const draft = { title: page.title, brief: page.brief,
    collections: JSON.parse(JSON.stringify(getCollections())) }
  mutate(draft)
  await save({ page_id: pageId, title: draft.title, brief: draft.brief,
    collections: stripCollectionsForSave(draft.collections), version: page.version, mask: 7 })
  if (getPage()?.page_id === pageId) commit(draft)
}

export function appendLinks(collections, { links, collectionIndex, newCollectionName }, createCollection) {
  if (!links?.length) throw new Error('No links to save')
  if (collectionIndex === -1 && newCollectionName?.trim()) {
    collections.push(createCollection(newCollectionName.trim(), links))
  } else if (collections[collectionIndex]) {
    collections[collectionIndex].links ||= []
    collections[collectionIndex].links.push(...links)
  } else {
    throw new Error('Select a folder before saving')
  }
}
