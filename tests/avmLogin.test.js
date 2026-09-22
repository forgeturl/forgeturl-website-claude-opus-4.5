import test from 'node:test'
import assert from 'node:assert/strict'
import { avmLoginRequest, validateAVMRedirect } from '../src/utils/avmLogin.js'

const callback = 'https://lixiaoyaoai.com/auth/callback'
function query(provider) {
  return new URLSearchParams({ avm_login: 'true', provider, redirect_uri: callback }).toString()
}

test('Google relay retains state on the Google callback origin', () => {
  const relay = avmLoginRequest(query('google'), 'https://forgeturl.brightguo.com')
  assert.equal(relay.provider, 'google')
  assert.equal(relay.relayOrigin, 'https://forgeturl.com')
  assert.equal(new URL(relay.relayUrl).searchParams.get('redirect_uri'), callback)
})
test('WeChat and legacy links keep the existing relay domain', () => {
  assert.equal(avmLoginRequest(query('wechat'), 'https://forgeturl.com').relayOrigin, 'https://forgeturl.brightguo.com')
  assert.equal(avmLoginRequest('?avm_login=true&redirect_uri='+encodeURIComponent(callback), 'https://forgeturl.com').provider, 'wechat')
  assert.equal(avmLoginRequest('', 'https://forgeturl.com'), null)
})
test('rejects unsupported providers and untrusted callback URLs', () => {
  assert.throws(() => avmLoginRequest(query('github'), 'https://forgeturl.com'))
  assert.throws(() => avmLoginRequest(query('__proto__'), 'https://forgeturl.com'))
  for (const url of ['https://evil.test/auth/callback','javascript:alert(1)',
    'https://lixiaoyaoai.com/other','https://user@lixiaoyaoai.com/auth/callback',
    callback+'?redirect=https://evil.test', 'http://localhost:5173/auth/callback']) {
    assert.throws(() => validateAVMRedirect(url, 'https://forgeturl.com'))
  }
})
test('localhost callbacks require a localhost relay', () => {
  assert.equal(validateAVMRedirect('http://localhost:5173/auth/callback','http://localhost:5174').hostname,'localhost')
})
