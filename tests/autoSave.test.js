import assert from 'node:assert/strict'
import test from 'node:test'

import { useAutoSave } from '../src/composables/useAutoSave.js'
import { resolveNextPageVersion } from '../src/utils/pageVersion.js'

const waitUntil = async (predicate) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  throw new Error('Timed out waiting for auto-save')
}

test('keeps immutable per-page snapshots and advances queued versions', async () => {
  let releaseFirstSave
  const firstSave = new Promise((resolve) => {
    releaseFirstSave = resolve
  })
  const calls = []

  const originalWarn = console.warn
  console.warn = () => {}
  const autoSave = useAutoSave(async (payload) => {
    calls.push(payload)
    if (calls.length === 1) {
      await firstSave
    }
    return { version: payload.version + 1 }
  })
  console.warn = originalWarn

  autoSave.markDirty({ page_id: 'A', version: 0, collections: [{ title: 'first' }] })
  await waitUntil(() => calls.length === 1)

  const latestA = { page_id: 'A', version: 0, collections: [{ title: 'second' }] }
  autoSave.markDirty(latestA)
  autoSave.markDirty({ page_id: 'B', version: 4, collections: [{ title: 'other page' }] })
  latestA.collections[0].title = 'mutated after queueing'

  // Simulate leaving the component while the first request is still active.
  autoSave.dispose()
  releaseFirstSave()
  await waitUntil(() => !autoSave.isSaving.value)

  assert.deepEqual(calls.map(({ page_id }) => page_id), ['A', 'A', 'B'])
  assert.equal(calls[1].version, 1)
  assert.equal(calls[1].collections[0].title, 'second')
  assert.equal(calls[2].version, 4)
  assert.equal(autoSave.isDirty.value, false)
})

test('advances when an older backend returns a non-advancing version', () => {
  assert.equal(resolveNextPageVersion(0, 0), 1)
  assert.equal(resolveNextPageVersion(undefined, 7), 8)
  assert.equal(resolveNextPageVersion(9, 8), 9)
})

test('flush waits for the active save before a cross-page operation', async () => {
  let releaseSave
  const saveGate = new Promise((resolve) => {
    releaseSave = resolve
  })
  let completed = false

  const originalWarn = console.warn
  console.warn = () => {}
  const autoSave = useAutoSave(async (payload) => {
    await saveGate
    completed = true
    return { version: payload.version + 1 }
  })
  console.warn = originalWarn

  autoSave.markDirty({ page_id: 'A', version: 2, collections: [{ title: 'latest' }] })
  const flushPromise = autoSave.flush()
  await Promise.resolve()
  assert.equal(completed, false)

  releaseSave()
  await flushPromise
  assert.equal(completed, true)
  assert.equal(autoSave.isDirty.value, false)
})
