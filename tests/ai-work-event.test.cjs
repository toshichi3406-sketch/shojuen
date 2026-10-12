const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript')
const root = path.resolve(__dirname, '..')
function load(file, fetchMock) {
  const filename = path.resolve(root, file), module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const req = name => {
    if (name === 'next/headers') return { cookies: async () => ({ get: () => ({ value: 'test-token' }) }) }
    if (name === 'next/server') return { NextRequest: Request, NextResponse: { json: (data, opts) => Response.json(data, opts) } }
    if (name === '../data/route') return { POST: () => { throw new Error('Unexpected case write') } }
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), name) + '.ts'), fetchMock)
    return require(name)
  }
  vm.runInNewContext(code, { module, exports: module.exports, require: req, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.test', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test' } }, fetch: fetchMock, Date, Intl, Request, Response, console })
  return module.exports
}
const helpers = load('src/lib/ai-work-event.ts')
const request = body => new Request('https://workboard.test/api', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
function setup(mode) {
  const state = { candidate: { id: 'candidate-1', candidate_type: 'work_event', status: 'pending', decision_note: null, payload: { note: 'Received the requested document' } }, work: { id: 'W001', title: 'Obtain supplier document', status: 'external_wait', next_action: 'Ask for document', updated_at: '2026-10-12T00:00:00Z', customer_id: 'C001', sales_case_id: 'case-1', memo: 'Keep this memo' }, events: [], writes: [] }
  const fetchMock = async (url, init = {}) => {
    const u = new URL(url), table = u.pathname.split('/').at(-1), method = init.method || 'GET', body = init.body ? JSON.parse(init.body) : null
    if (method === 'GET') return Response.json(table === 'ai_import_candidates' ? [state.candidate] : table === 'work_items' ? [state.work] : table === 'sales_cases' ? [{ id: 'case-1', customer_id: 'C001' }] : table === 'work_events' ? state.events.filter(e => e.source_candidate_id === state.candidate.id) : [])
    state.writes.push({ table, method, body })
    if (table === 'ai_import_candidates') { Object.assign(state.candidate, body); return Response.json([state.candidate]) }
    if (table === 'work_items') {
      if (mode === 'work-error') return new Response('save failed', { status: 500 })
      if (mode === 'race') return Response.json([])
      Object.assign(state.work, body); return Response.json([state.work])
    }
    if (table === 'work_events') {
      if (mode === 'event-error') return new Response('save failed', { status: 500 })
      if (mode === 'audit-error' && body.source === 'workboard_auto') return new Response('save failed', { status: 500 })
      const row = { ...body, id: 'event-' + (state.events.length + 1) }; state.events.push(row); return Response.json([row])
    }
    throw new Error('Unexpected mutation: ' + table)
  }
  const body = { id: state.candidate.id, candidate_type: 'work_event', payload: { ...state.candidate.payload, work_item_id: 'W001', event_type: 'reply_received', event_date: '2026-10-11T00:00:00Z', channel: 'Email', counterparty_name: 'Supplier', direction: 'inbound' }, workUpdate: { status: 'prep', next_action: 'Check document date and product' }, workUpdateConfirmed: true, expectedWork: { status: 'external_wait', next_action: 'Ask for document' } }
  return { state, body, api: load('src/app/api/workboard/ai-import/route.ts', fetchMock) }
}
test('No change is default; updates need human confirmation and reject unrelated fields', () => {
  assert.equal(helpers.eventWorkPatch({}), null)
  assert.throws(() => helpers.eventWorkPatch({ status: 'prep' }), /確認/)
  assert.throws(() => helpers.validateEventWorkPatch({ customer_id: 'C002' }), /状態と次の/)
  assert.throws(() => helpers.validateEventWorkPatch({ status: 'unknown' }), /状態/)
  assert.throws(() => helpers.validateEventWorkPatch({ status: null }), /空/)
  assert.equal(helpers.eventWorkPatch({ updateNextAction: true, nextAction: '', confirmed: true }).next_action, null)
})
test('Record activity and update work together; preserve original date, links and counterparty; retry never moves work again', async () => {
  const { state, body, api } = setup()
  const response = await api.PUT(request(body)); assert.equal(response.status, 200)
  assert.equal((await response.json()).workUpdated, true)
  assert.equal(state.work.status, 'prep'); assert.equal(state.work.memo, 'Keep this memo')
  assert.equal(state.events[0].event_date, body.payload.event_date)
  assert.equal(state.events[0].counterparty_name, 'Supplier')
  assert.equal(state.events[0].work_item_id, 'W001'); assert.equal(state.events[0].sales_case_id, 'case-1')
  assert.match(state.events[1].note, /相手待ち → 確認・準備中/)
  assert.equal(state.events[1].source, 'workboard_auto')
  assert.ok(!state.writes.some(w => w.table === 'sales_cases'))
  const count = state.writes.length; state.work.status = 'done'
  await api.PUT(request(body)); assert.equal(state.writes.length, count); assert.equal(state.work.status, 'done')
})
test('Activity only and same-value updates never rewrite work', async () => {
  for (const workUpdate of [null, { status: 'external_wait', next_action: 'Ask for document' }]) {
    const { state, body, api } = setup(); body.workUpdate = workUpdate
    assert.equal((await api.PUT(request(body))).status, 200)
    assert.ok(!state.writes.some(w => w.table === 'work_items')); assert.equal(state.events.length, 1)
  }
})
test('Backward state and next-action-only changes are valid; clearing action is explicit', async () => {
  for (const workUpdate of [{ status: 'todo' }, { next_action: null }]) {
    const { state, body, api } = setup(); body.workUpdate = workUpdate
    assert.equal((await api.PUT(request(body))).status, 200)
    assert.equal(workUpdate.status ? state.work.status : state.work.next_action, workUpdate.status || null)
  }
})
test('Stale expected work or missing confirmation cannot save either activity or work', async () => {
  for (const kind of ['stale', 'unconfirmed', 'no-work']) {
    const { state, body, api } = setup()
    if (kind === 'stale') body.expectedWork.status = 'doing'
    if (kind === 'unconfirmed') body.workUpdateConfirmed = false
    if (kind === 'no-work') body.payload.work_item_id = null
    assert.ok([400, 409].includes((await api.PUT(request(body))).status)); assert.equal(state.writes.length, 0)
  }
})
test('Case-only and standalone activity never update work', async () => {
  for (const sales_case_id of [null, 'case-1']) {
    const { state, body, api } = setup(); body.payload.work_item_id = null; body.payload.sales_case_id = sales_case_id; body.workUpdate = null
    assert.equal((await api.PUT(request(body))).status, 200); assert.equal(state.events[0].sales_case_id, sales_case_id)
    assert.ok(!state.writes.some(w => w.table === 'work_items'))
  }
})
test('Activity save failure prevents work change and blocks blind retry', async () => {
  const { state, body, api } = setup('event-error')
  assert.equal((await api.PUT(request(body))).status, 500); assert.equal(state.work.status, 'external_wait')
  assert.ok(!state.writes.some(w => w.table === 'work_items'))
  assert.equal((await api.PUT(request(body))).status, 409)
})
test('Work update failure or concurrent change returns saved-activity warning and never duplicates on retry', async () => {
  for (const mode of ['work-error', 'race']) {
    const { state, body, api } = setup(mode)
    const response = await api.PUT(request(body)); assert.equal(response.status, 200)
    const result = await response.json(); assert.match(result.warning, /活動履歴は保存済み/); assert.equal(result.workUpdated, false)
    assert.equal(state.work.status, 'external_wait'); assert.equal(state.events.length, 1)
    const count = state.writes.length; await api.PUT(request(body)); assert.equal(state.writes.length, count)
    assert.match(state.candidate.decision_note, /更新要確認/)
  }
})
test('Audit failure leaves saved activity and updated work visible without duplicate writes', async () => {
  const { state, body, api } = setup('audit-error')
  const result = await (await api.PUT(request(body))).json()
  assert.equal(result.workUpdated, true); assert.match(result.warning, /変更履歴を保存できません/)
  assert.equal(state.work.status, 'prep'); assert.equal(state.events.length, 1)
  assert.equal(state.candidate.payload._work_event_update_result.updated, true)
})
