import test from 'node:test'
import assert from 'node:assert/strict'
import { persistPageMutation, appendLinks } from '../src/utils/pageMutation.js'

function fixture(save) {
  const page = { page_id:'A',title:'A',brief:'',version:0,collections:[] }
  let collections = [{title:'folder',__idx:'one',links:[{title:'old',url:'https://example.com'}]}]
  return { page, collections:()=>collections, run:mutate=>persistPageMutation({getPage:()=>page,getCollections:()=>collections,commit:d=>{collections=d.collections},flush:async()=>{page.version=2},save,mutate}) }
}
test('explicit folder edits wait for persistence and failed edits never reach local state', async()=>{
 const f=fixture(async()=>{throw new Error('offline')})
 await assert.rejects(f.run(d=>{d.collections[0].title='new'}),/offline/)
 assert.equal(f.collections()[0].title,'folder')
})
test('complete snapshot uses refreshed version and strips client IDs',async()=>{
 let sent
 const f=fixture(async payload=>{sent=payload})
 await f.run(d=>{d.collections.push({title:'new',links:[]})})
 assert.equal(sent.version,2);assert.equal(sent.collections.length,2);assert.equal('__idx' in sent.collections[0],false)
 assert.equal(f.collections()[0].__idx,'one');assert.equal(f.collections().length,2)
})
test('refuses writes when only a page brief has been loaded',async()=>{
 let called=false
 const f=fixture(async()=>{called=true});delete f.page.collections
 await assert.rejects(f.run(()=>{}),/load/);assert.equal(called,false)
})
test('adding links cannot silently succeed against a missing target',()=>{
 assert.throws(()=>appendLinks([],{links:[{}],collectionIndex:3},()=>{}),/Select/)
})
