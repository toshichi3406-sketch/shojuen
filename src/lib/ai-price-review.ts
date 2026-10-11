export function tokyoDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(date) : ''
}

export type PriceRecord = {
  kind: 'price_review_v1'; mode: 'standard' | 'plan'; scope: 'standard' | 'customer';
  productId: string; customerId: string; salesCaseId: string; amount: number;
  currency: string; unit: string; effectiveFrom: string; conditions: string; text: string
}

export function priceRecord(payload: Record<string, unknown>, mode: 'standard' | 'plan'): PriceRecord {
  const productId = String(payload.product_id || '').trim()
  const raw = payload.amount ?? payload.price
  const amount = Number(String(raw ?? '').replace(/[,\s¥￥]/g, ''))
  const scope = mode === 'standard' ? 'standard' : String(payload.plan_scope || '')
  if (!productId) throw new Error('商品を選択してください。')
  if (raw == null || String(raw).trim() === '' || !Number.isFinite(amount) || amount <= 0) throw new Error('価格は0より大きい数値で入力してください。')
  if (!['standard', 'customer'].includes(scope)) throw new Error('価格案の対象を選択してください。相手未定なら候補に残してください。')
  const customerId = scope === 'customer' ? String(payload.customer_id || '').trim() : ''
  if (scope === 'customer' && !customerId) throw new Error('提案予定の取引先を選択してください。')
  const currency = String(payload.currency || 'JPY').trim().toUpperCase()
  const unit = String(payload.unit || 'kg').trim()
  if (!/^[A-Z]{3}$/.test(currency) || !unit || unit.length > 30) throw new Error('通貨と単位を確認してください。')
  const effectiveFrom = String(payload.effective_from || '')
  if (effectiveFrom && (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom) || !Number.isFinite(Date.parse(effectiveFrom + 'T00:00:00Z')) || new Date(effectiveFrom + 'T00:00:00Z').toISOString().slice(0,10) !== effectiveFrom)) throw new Error('適用開始日を確認してください。')
  if (mode === 'standard' && !effectiveFrom) throw new Error('標準卸価格の適用開始日を入力してください。')
  const conditions = String(payload.conditions || '').trim()
  const text = `${mode === 'standard' ? '標準卸価格を採用' : scope === 'standard' ? '標準卸価格案（未採用）' : '取引先への提案予定価格（未提示）'}：${productId} ${amount.toLocaleString('ja-JP')} ${currency}/${unit}${effectiveFrom ? ` ／ 適用開始 ${effectiveFrom}` : ''}${conditions ? ` ／ ${conditions}` : ''}${payload.note ? `\n${String(payload.note)}` : ''}`
  return { kind: 'price_review_v1', mode, scope: scope as PriceRecord['scope'], productId, customerId, salesCaseId: scope === 'customer' ? String(payload.sales_case_id || '') : '', amount, currency, unit, effectiveFrom, conditions, text }
}

export function parsePriceRecord(note?: string): PriceRecord | null {
  try { const row = JSON.parse(note || ''); return row.kind === 'price_review_v1' && ['plan','standard'].includes(row.mode) && typeof row.text === 'string' && typeof row.productId === 'string' ? row : null } catch { return null }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}'
  return JSON.stringify(value) ?? 'null'
}
export function importIdentity(candidate: { candidate_type: string; title?: string | null; target_id?: string | null; payload?: Record<string, unknown> }) {
  // An origin's stable record identifier survives note/status edits and new daily sessions.
  const payload = { ...(candidate.payload || {}) }
  delete payload._import_fingerprint
  if (payload.price_classification === "proposed") payload.price_classification = "customer_planned"
  const recordId = payload.source_record_id
  return recordId ? canonical([candidate.candidate_type, recordId]) : canonical([candidate.candidate_type, (candidate.title || '').trim(), candidate.target_id || null, payload])
}
