// Only same-site paths may survive an OAuth round trip, including the relay
// through the separate WeChat login origin.
export function safeLoginRedirect(value, fallback = '/my') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback
  const url = new URL(value, 'https://forgeturl.com')
  return url.origin === 'https://forgeturl.com' ? `${url.pathname}${url.search}${url.hash}` : fallback
}
