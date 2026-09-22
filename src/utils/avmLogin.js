// AVM relay policy is pure so redirects can be tested without an OAuth session.
const CALLBACK_ORIGINS = new Set([
  'https://avm.brightguo.com', 'https://lixiaoyaoai.com', 'https://www.lixiaoyaoai.com',
])
const RELAY_ORIGINS = { wechat: 'https://forgeturl.brightguo.com', google: 'https://forgeturl.com' }

export function validateAVMRedirect(value, currentOrigin) {
  const url = new URL(value)
  const current = new URL(currentOrigin)
  const local = ['localhost', '127.0.0.1'].includes(current.hostname)
    && ['localhost', '127.0.0.1'].includes(url.hostname)
    && ['http:', 'https:'].includes(url.protocol)
  if ((!CALLBACK_ORIGINS.has(url.origin) && !local) || url.pathname !== '/auth/callback'
      || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid AVM callback address')
  }
  return url
}

export function avmLoginRequest(search, currentOrigin) {
  const params = new URLSearchParams(search)
  if (params.get('avm_login') !== 'true') return null
  const provider = params.get('provider') || 'wechat'
  if (!Object.hasOwn(RELAY_ORIGINS, provider)) throw new Error('Unsupported AVM login provider')
  const redirect = validateAVMRedirect(params.get('redirect_uri'), currentOrigin)
  const local = ['localhost', '127.0.0.1'].includes(new URL(currentOrigin).hostname)
  const relay = new URL('/', local ? currentOrigin : RELAY_ORIGINS[provider])
  relay.search = new URLSearchParams({ avm_login: 'true', provider, redirect_uri: redirect.href }).toString()
  return { provider, redirectUri: redirect.href, relayUrl: relay.href, relayOrigin: relay.origin }
}
