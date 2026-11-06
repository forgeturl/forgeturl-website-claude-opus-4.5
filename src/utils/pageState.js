import { ref } from 'vue'
import { resolveNextPageVersion } from './pageVersion.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const shareFields = { readonly: 'readonly_page_id', edit: 'edit_page_id', admin: 'admin_page_id' }

// Keep API transport separate so state transitions can be exercised with delayed
// and failed responses without a browser or a live account.
export function createPageState(api) {
  const myPages = ref([])
  const currentPage = ref(null)
  const loading = ref(false)
  const spaceName = ref('')
  let activeRequests = 0
  let pageRequest = 0
  let requestedPageId = null
  let spaceRequest = 0
  let epoch = 0
  let membershipQueue = Promise.resolve()
  const revisions = new Map()
  const accessRevisions = new Map()

  const request = async (action) => {
    activeRequests += 1
    loading.value = true
    try { return await action() }
    finally { loading.value = --activeRequests > 0 }
  }
  const revision = (id) => revisions.get(id) || 0
  const accessRevision = (id) => accessRevisions.get(id) || 0
  const invalidateAccess = (id) => accessRevisions.set(id, accessRevision(id) + 1)
  const mutateMembership = (action) => {
    const startedEpoch = epoch
    const result = membershipQueue.then(() => {
      if (startedEpoch !== epoch) throw new Error('Session changed')
      return request(action)
    })
    membershipQueue = result.catch(() => {})
    return result
  }
  const changed = (id) => revisions.set(id, revision(id) + 1)
  const matchingPages = (id) => [...new Set([
    currentPage.value,
    myPages.value.find(page => page.page_id === id)
  ].filter(page => page?.page_id === id))]
  const cachedPage = (id) => matchingPages(id)
    .filter(page => Array.isArray(page.collections))
    .sort((a, b) => Number(b.version || 0) - Number(a.version || 0))[0]

  const applyBrief = (brief, existing) => {
    if (brief.is_not_found) {
      invalidateAccess(brief.page_id)
      for (const page of new Set([...matchingPages(brief.page_id), existing].filter(Boolean))) {
        for (const key of Object.keys(page)) delete page[key]
        Object.assign(page, brief, { page_conf: {}, is_not_found: true })
      }
    }
    if (existing) { Object.assign(existing, brief); return existing }
    return brief
  }
  const applyOrder = (ids, briefs = []) => {
    const pages = new Map(myPages.value.map(page => [page.page_id, page]))
    for (const brief of briefs) pages.set(brief.page_id, applyBrief(brief, pages.get(brief.page_id)))
    // Another tab may have joined a page this tab has never loaded. Preserve
    // its position until the next summary refresh can hydrate it.
    myPages.value = ids.map(id => pages.get(id) || { page_id: id, page_conf: {} })
  }

  const fetchMySpace = () => request(async () => {
    const sequence = ++spaceRequest
    const requestEpoch = epoch
    const data = await api.getMySpace()
    if (sequence !== spaceRequest || requestEpoch !== epoch) return data
    const previous = new Map(myPages.value.map(page => [page.page_id, page]))
    myPages.value = (data.page_briefs || []).map(brief => {
      const existing = previous.get(brief.page_id)
      // Preserve object identity and full details; consumers keep separate local
      // edit buffers and must not reset those merely because the sidebar refreshed.
      return applyBrief(brief, existing)
    })
    spaceName.value = data.space_name || 'My Space'
    return data
  })

  const fetchPage = (pageId) => request(async () => {
    const sequence = ++pageRequest
    requestedPageId = pageId
    const requestEpoch = epoch
    const startedRevision = revision(pageId)
    const startedAccess = accessRevision(pageId)
    let data
    try { data = await api.getPage(pageId) }
    catch (error) {
      const code = Number(error.code || error.response?.data?.code || error.response?.status)
      if (requestEpoch === epoch && [404, 410].includes(code)) {
        applyBrief({ page_id: pageId, is_not_found: true, page_conf: {} }, myPages.value.find(page => page.page_id === pageId))
      }
      throw error
    }
    if (startedAccess !== accessRevision(pageId)) throw new Error('Page access changed')
    const received = data.page || data
    const cached = cachedPage(pageId)
    // A read started before a successful write must not restore old content or
    // sharing settings. Its caller receives the freshest known page as well.
    const page = cached && (revision(pageId) !== startedRevision ||
      Number(cached.version) > Number(received.version)) ? clone(cached) : received
    if (sequence === pageRequest && requestEpoch === epoch) currentPage.value = page
    return page
  })

  const createPage = (pageData) => mutateMembership(async () => {
    const requestEpoch = epoch
    const snapshot = clone(pageData)
    const result = await api.createPage(snapshot)
    if (requestEpoch !== epoch) return result
    ++spaceRequest
    const page = {
      ...snapshot, page_id: result.page_id, version: result.version ?? 0,
      is_self: true, page_conf: { can_edit: true, can_delete: true },
      readonly_page_id: '', edit_page_id: '', admin_page_id: ''
    }
    const order = result.page_ids || [page.page_id, ...myPages.value.map(item => item.page_id)]
    applyOrder(order, [page])
    // The mutation already succeeded. A secondary list refresh must not turn
    // that success into a retry that creates another page.
    return result
  })

  const updatePage = (pageData) => request(async () => {
    const requestEpoch = epoch
    const snapshot = clone(pageData)
    const startedAccess = accessRevision(snapshot.page_id)
    const before = new Map(matchingPages(snapshot.page_id).map(page => [page, { title: page.title, brief: page.brief }]))
    let result
    try { result = await api.updatePage(snapshot) }
    catch (error) {
      const code = Number(error.code || error.response?.data?.code || error.response?.status)
      if (requestEpoch === epoch && [404, 410].includes(code)) {
        applyBrief({ page_id: snapshot.page_id, is_not_found: true, page_conf: {} }, myPages.value.find(page => page.page_id === snapshot.page_id))
      }
      throw error
    }
    const nextVersion = resolveNextPageVersion(result?.version, snapshot.version)
    if (requestEpoch === epoch && startedAccess === accessRevision(snapshot.page_id)) {
      ++spaceRequest
      changed(snapshot.page_id)
      for (const page of matchingPages(snapshot.page_id)) {
        if (Number(page.version) > nextVersion) continue
        page.version = nextVersion
        if (result?.update_time) page.update_time = result.update_time
        const original = before.get(page)
        if ((snapshot.mask & 1) && (!original || page.title === original.title)) page.title = snapshot.title
        if ((snapshot.mask & 2) && (!original || page.brief === original.brief)) page.brief = snapshot.brief
        if (snapshot.mask & 4) page.collections = clone(snapshot.collections || [])
      }
    }
    return { ...(result || {}), version: nextVersion }
  })

  const transferCollection = (options) => request(async () => {
    const { sourcePageId, targetPageId, sourceCollectionIndex, operation, sourceVersion } = options
    const requestEpoch = epoch
    const sourceAccess = accessRevision(sourcePageId), targetAccess = accessRevision(targetPageId)
    const targetData = await api.getPage(targetPageId)
    const targetPage = targetData.page || targetData
    const result = await api.transferCollection({
      source_page_id: sourcePageId, target_page_id: targetPageId,
      source_collection_index: sourceCollectionIndex, operation,
      source_version: sourceVersion, target_version: targetPage.version
    })
    if (requestEpoch === epoch) {
      ++spaceRequest
      const collection = cachedPage(sourcePageId)?.collections?.[sourceCollectionIndex]
      changed(sourcePageId); changed(targetPageId)
      for (const page of matchingPages(sourcePageId)) {
        if (sourceAccess !== accessRevision(sourcePageId)) continue
        page.version = result.source_version
        if (result.update_time) page.update_time = result.update_time
        if (operation === 'move' && Array.isArray(page.collections)) {
          page.collections = clone(page.collections)
          page.collections.splice(sourceCollectionIndex, 1)
        }
      }
      for (const page of matchingPages(targetPageId)) {
        if (targetAccess !== accessRevision(targetPageId)) continue
        page.version = result.target_version
        if (result.update_time) page.update_time = result.update_time
        if (collection && Array.isArray(page.collections)) page.collections = [...clone(targetPage.collections || []), clone(collection)]
      }
    }
    return result
  })

  const deletePage = (pageId) => mutateMembership(async () => {
    const requestEpoch = epoch
    const result = await api.deletePage(pageId)
    if (requestEpoch !== epoch) return result
    ++spaceRequest
    if (requestedPageId === pageId) {
      ++pageRequest
      requestedPageId = null
    }
    changed(pageId)
    myPages.value = myPages.value.filter(page => page.page_id !== pageId)
    if (currentPage.value?.page_id === pageId) {
      currentPage.value = null
    }
    return result
  })

  const savePageOrder = (pageIds) => {
    const requested = [...pageIds], base = myPages.value.map(page => page.page_id)
    return mutateMembership(async () => {
      const requestEpoch = epoch
      const result = await api.savePageIds(requested, base)
      if (requestEpoch === epoch && result.page_ids) {
        ++spaceRequest
        applyOrder(result.page_ids)
      }
      return result
    })
  }

  const addSharedPage = (pageId) => mutateMembership(async () => {
    const requestEpoch = epoch
    const startedAccess = accessRevision(pageId)
    const result = await api.addSharedPage(pageId)
    if (requestEpoch === epoch) {
      ++spaceRequest
      applyOrder(result.page_ids, result.page_brief && startedAccess === accessRevision(pageId) ? [result.page_brief] : [])
    }
    return result
  })

  const removeSharedPage = (pageId) => mutateMembership(async () => {
    const requestEpoch = epoch
    const result = await api.removeSharedPage(pageId)
    if (requestEpoch === epoch) {
      ++spaceRequest
      invalidateAccess(pageId)
      if (requestedPageId === pageId) { ++pageRequest; requestedPageId = null }
      if (currentPage.value?.page_id === pageId) currentPage.value = null
      applyOrder(result.page_ids)
    }
    return result
  })

  const changeShareLink = (pageId, pageType, remove) => request(async () => {
    const field = shareFields[pageType]
    if (!field) throw new Error('Invalid share link type')
    const requestEpoch = epoch
    const startedAccess = accessRevision(pageId)
    const result = await api[remove ? 'removePageLink' : 'addPageLink'](pageId, pageType)
    if (requestEpoch === epoch && startedAccess === accessRevision(pageId)) {
      changed(pageId)
      for (const page of matchingPages(pageId)) page[field] = remove ? '' : result.new_page_id
    }
    return result
  })
  const addPageLink = (pageId, pageType) => changeShareLink(pageId, pageType, false)
  const removePageLink = (pageId, pageType) => changeShareLink(pageId, pageType, true)

  const clear = () => {
    ++epoch; ++pageRequest; ++spaceRequest
    requestedPageId = null
    revisions.clear()
    myPages.value = []; currentPage.value = null; spaceName.value = ''
  }

  return { myPages, currentPage, loading, spaceName, fetchMySpace, fetchPage,
    createPage, updatePage, transferCollection, deletePage, savePageOrder, addSharedPage, removeSharedPage,
    addPageLink, removePageLink, clear }
}
