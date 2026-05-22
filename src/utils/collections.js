/**
 * Client-side collection/link identity helpers.
 * __idx is used for drag-and-drop tracking and is stripped before API saves.
 */

export function createIdx() {
  return crypto.randomUUID()
}

export function ensureLinkIdx(link) {
  if (!link.__idx) {
    link.__idx = createIdx()
  }
  return link
}

export function ensureCollectionIdx(collection) {
  if (!collection.__idx) {
    collection.__idx = createIdx()
  }
  ;(collection.links || []).forEach(ensureLinkIdx)
  return collection
}

export function ensureCollectionsIdx(collections) {
  ;(collections || []).forEach(ensureCollectionIdx)
  return collections || []
}

export function cloneCollectionWithNewIds(collection) {
  const copy = JSON.parse(JSON.stringify(collection))
  copy.__idx = createIdx()
  ;(copy.links || []).forEach((link) => {
    link.__idx = createIdx()
  })
  return copy
}

export function createEmptyCollection(title = '', links = []) {
  const collection = {
    __idx: createIdx(),
    title,
    links: links.map((link) => ensureLinkIdx({ ...link }))
  }
  return collection
}

export function stripCollectionsForSave(collections) {
  return JSON.parse(JSON.stringify(collections || [])).map((col) => {
    const { __idx, ...rest } = col
    return {
      ...rest,
      links: (rest.links || []).map((link) => {
        const { __idx: _linkIdx, ...linkRest } = link
        return linkRest
      })
    }
  })
}

export function removeCollectionByIdx(collections, collectionIdx) {
  const colIndex = collections.findIndex((c) => c.__idx === collectionIdx)
  if (colIndex < 0) return false
  collections.splice(colIndex, 1)
  return true
}

export function removeLinkByIdx(collections, collectionIdx, linkIdx) {
  const colIndex = collections.findIndex((c) => c.__idx === collectionIdx)
  if (colIndex < 0) return false
  const links = collections[colIndex].links || []
  const linkIndex = links.findIndex((l) => l.__idx === linkIdx)
  if (linkIndex < 0) return false
  links.splice(linkIndex, 1)
  return true
}
