import request from '@/utils/request'

export function getOpenClawApiKey() {
  return request({
    url: '/openclaw/getApiKey',
    method: 'POST',
    data: {}
  })
}

export function regenerateOpenClawApiKey() {
  return request({
    url: '/openclaw/regenerateApiKey',
    method: 'POST',
    data: {}
  })
}

export function addTmpBookmark(data) {
  return request({
    url: '/openclaw/tmpBookmark/add',
    method: 'POST',
    data
  })
}

export function listTmpBookmarks(limit = 200) {
  return request({
    url: '/openclaw/tmpBookmark/list',
    method: 'POST',
    data: { limit }
  })
}

export function existsTmpBookmark(data) {
  return request({
    url: '/openclaw/tmpBookmark/exists',
    method: 'POST',
    data
  })
}

export function moveTmpBookmarkToPage(data) {
  return request({
    url: '/openclaw/tmpBookmark/moveToPage',
    method: 'POST',
    data
  })
}

export function movePageBookmarkToTmp(data) {
  return request({
    url: '/openclaw/tmpBookmark/moveFromPage',
    method: 'POST',
    data
  })
}
