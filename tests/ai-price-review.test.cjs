// Run: node --test tests/ai-price-review.test.cjs
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function load(file, fetchMock) {
  const filename = path.resolve(root, file)
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const req = name => {
    if (name === 'next/headers') return { cookies: async () => ({ get: () => ({ value: 'test-token' }) }) }
    if (name === 'next/server') return { NextRequest: Request, NextResponse: { json: (data,opts) => Response.json(data,opts) } }
    if (name === '../data/route') return { POST: () => { throw new Error('Unexpected general data write') } }
    if (name.startsWith('.')) return load(path.relative(root,path.resolve(path.dirname(filename),name)+'.ts'),fetchMock)
    return require(name)
  }
  vm.runInNewContext(code,{module,exports:module.exports,require:req,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://database.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test'}},fetch:fetchMock,Date,Intl,Request,Response,console})
  return module.exports
}
const helpers = load('src/lib/ai-price-review.ts')
const base = { product_id:'M001', amount:12000, currency:'JPY', unit:'kg', effective_from:'2026-10-11' }
test('Japanese import date is distinct from UTC day',()=>{
  assert.equal(helpers.tokyoDate('2026-10-11T15:05:00Z'),'2026-10-12')
  assert.equal(helpers.tokyoDate('invalid'),'')
})
test('Unknown scope and missing counterparty remain candidates; plans never become quotes',()=>{
  assert.throws(()=>helpers.priceRecord(base,'plan'),/対象/)
  assert.throws(()=>helpers.priceRecord({...base,plan_scope:'customer'},'plan'),/取引先/)
  const row=helpers.priceRecord({...base,plan_scope:'customer',customer_id:'C001'},'plan')
  assert.equal(row.mode,'plan');assert.match(row.text,/未提示/)
  assert.equal(helpers.priceRecord({...base,plan_scope:'standard',customer_id:'C001'},'plan').customerId,'')
})
test('Reject empty, zero, negative prices and invalid dates',()=>{
  for(const amount of ['',0,-1,'abc']) assert.throws(()=>helpers.priceRecord({...base,amount},'standard'))
  assert.throws(()=>helpers.priceRecord({...base,effective_from:'2026-02-30'},'standard'),/開始日/)
  assert.throws(()=>helpers.priceRecord({...base,effective_from:''},'standard'),/開始日/)
})
test('Identical reimports deduplicate regardless of object order; changed facts remain distinct',()=>{
  const a={candidate_type:'price_candidate',title:'A',payload:{amount:100,unit:'kg'}}
  const b={candidate_type:'price_candidate',title:'A',payload:{unit:'kg',amount:100}}
  assert.equal(helpers.importIdentity(a),helpers.importIdentity(b))
  assert.notEqual(helpers.importIdentity(a),helpers.importIdentity({...b,payload:{amount:200,unit:'kg'}}))
  assert.notEqual(helpers.importIdentity({...a,target_id:'W001'}),helpers.importIdentity({...a,target_id:'W002'}))
  assert.equal(helpers.importIdentity({...a,payload:{source_record_id:'message-id:1',note:'old'}}),helpers.importIdentity({...a,payload:{source_record_id:'message-id:1',note:'edited'}}))
})
function db() {
  const state={ product:{id:'M001',standard_wholesale_price:'11,000 JPY/kg',updated_at:'2026-10-11T00:00:00Z'}, candidate:{id:'11111111-1111-4111-8111-111111111111',candidate_type:'price_candidate',status:'pending',decision_note:null,payload:base}, events:[],writes:[] }
  const fetchMock=async (url,init={})=>{
    const u=new URL(url),table=u.pathname.split('/').at(-1),method=init.method || 'GET',body=init.body?JSON.parse(init.body):null
    if(method==='GET')return Response.json(table==='ai_import_candidates'?[state.candidate]:table==='products'?[state.product]:table==='customers'?[{id:'C001'}]:[])
    state.writes.push({table,method,body})
    if(table==='ai_import_candidates'){Object.assign(state.candidate,body);return Response.json([state.candidate])}
    if(table==='products'){Object.assign(state.product,body);return Response.json([state.product])}
    if(table==='work_events'){state.events.push(body);return Response.json([body])}
    throw new Error('Unexpected write: '+table)
  }
  return {state,api:load('src/app/api/workboard/ai-import/route.ts',fetchMock)}
}
const request = payload => new Request('https://workboard.test/api',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
test('Standard adoption updates only wholesale price and stores provenance; retry writes nothing',async()=>{
  const {state,api}=db()
  const body={id:state.candidate.id,candidate_type:'price_candidate',expectedStandardPrice:state.product.standard_wholesale_price,payload:{...base,price_classification:'standard_wholesale'}}
  const response=await api.PUT(request(body));assert.equal(response.status,200)
  assert.equal(state.product.standard_wholesale_price,'12,000 JPY/kg')
  assert.match(state.candidate.decision_note,/標準卸価格へ反映/)
  assert.equal(JSON.parse(state.events[0].note).previousPrice,'11,000 JPY/kg')
  const count=state.writes.length;assert.equal((await api.PUT(request(body))).status,200);assert.equal(state.writes.length,count)
})
test('Customer plan is separate from adopted and quoted prices',async()=>{
  const {state,api}=db()
  const response=await api.PUT(request({id:state.candidate.id,candidate_type:'price_candidate',payload:{...base,price_classification:'customer_planned',plan_scope:'customer',customer_id:'C001'}}))
  assert.equal(response.status,200);assert.equal(state.product.standard_wholesale_price,'11,000 JPY/kg')
  assert.equal(state.events[0].event_type,'note')
  assert.equal(JSON.parse(state.events[0].note).customerId,'C001')
  assert.ok(!state.writes.some(w=>['products','customer_prices'].includes(w.table)))
})
test('Stale current price and future adoption cannot overwrite master',async()=>{
  for(const payload of [{...base},{...base,effective_from:'2099-01-01'}]){
    const {state,api}=db()
    const response=await api.PUT(request({id:state.candidate.id,candidate_type:'price_candidate',expectedStandardPrice:'outdated',payload:{...payload,price_classification:'standard_wholesale'}}))
    assert.ok([400,409].includes(response.status));assert.equal(state.writes.length,0)
  }
})
test('Reimporting exact candidates preserves prior needs-edit/rejected state without a new batch',async()=>{
  for (const status of ['needs_edit','rejected']) {
    const {state,api}=db();state.candidate.status=status;state.candidate.title='Example'
    const response=await api.POST(new Request('https://workboard.test/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({source:'chatgpt',session_title:'next day',candidates:[{candidate_type:'price_candidate',title:'Example',payload:base}]})}))
    assert.equal(response.status,200);const result=await response.json();assert.equal(result.candidateCount,0);assert.equal(result.skippedCount,1)
    assert.equal(state.writes.length,0);assert.equal(state.candidate.status,status)
  }
})
test('Original import identity survives candidate corrections',async()=>{
  const {state,api}=db()
  const origin={candidate_type:'price_candidate',title:'Example',payload:base}
  const hash=require('node:crypto').createHash('sha256').update(helpers.importIdentity(origin)).digest('hex')
  state.candidate.title='Corrected Example';state.candidate.status='needs_edit'
  state.candidate.payload={...base,note:'edited',_import_fingerprint:hash}
  const response=await api.POST(new Request('https://workboard.test/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({source:'chatgpt',session_title:'next day',candidates:[origin]})}))
  assert.equal((await response.json()).skippedCount,1);assert.equal(state.writes.length,0)
})
