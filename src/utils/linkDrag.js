/** Complete drops on collection headers/padding that fall outside Sortable's list. */
export function completeLinkDrop(collections, linkIdx, event) {
  const originalEvent = event?.originalEvent
  const point = originalEvent?.changedTouches?.[0] || originalEvent
  if (!linkIdx || ['dragend', 'touchcancel', 'pointercancel'].includes(originalEvent?.type) ||
      !Number.isFinite(point?.clientX) || !Number.isFinite(point?.clientY)) return false

  // Native drop retains the actual hit target even if Vue has since relaid out
  // the lists. Touch end targets the source, so use its final coordinates.
  const hit = originalEvent.type === 'drop' ? originalEvent.target
    : document.elementFromPoint(point.clientX, point.clientY)
  const targetElement = hit?.closest('[data-link-collection]')
  const target = collections.find(collection => collection.__idx === targetElement?.dataset.linkCollection)
  if (!target) return false

  // Sortable has already applied an intentional position inside this list.
  if (event.to?.closest('[data-link-collection]') === targetElement) return false

  const source = collections.find(collection => collection.links?.some(link => link.__idx === linkIdx))
  if (!source || source === target) return false
  const index = source.links.findIndex(link => link.__idx === linkIdx)
  const [link] = source.links.splice(index, 1)
  target.links ||= []
  target.links.push(link)
  return true
}
