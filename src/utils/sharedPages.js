export const isSharedEntry = page => !!page && !page.is_self && /^[REA]/.test(page.page_id || '')
export const sharedPageLabel = page => page.is_not_found ? 'sharedSpace.expired'
  : page.page_conf?.can_edit ? 'sharedSpace.editable' : 'sharedSpace.readOnly'
