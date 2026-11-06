import assert from 'node:assert/strict'
import test from 'node:test'
import { safeLoginRedirect } from '../src/utils/loginRedirect.js'

test('login retains the full local share path and query', () => {
  assert.equal(safeLoginRedirect('/share/E2cGtMA?from=friend#links'), '/share/E2cGtMA?from=friend#links')
})
test('login rejects external and browser-normalized cross-origin redirects', () => {
  for (const path of ['https://evil.example', '//evil.example/x', '/\\evil.example', '/\nevil.example', ['//evil.example'], null]) {
    assert.equal(safeLoginRedirect(path), '/my')
  }
})
