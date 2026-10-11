"use client"

type Option = { id: string; name: string; price?: string }
type CaseOption = { id: string; title: string; customerId: string }
type Props = {
  mode: 'standard' | 'plan'; values: Record<string, string>; productId: string; customerId: string;
  products: Option[]; customers: Option[]; cases: CaseOption[]; busy: boolean;
  onProduct: (id: string) => void; onCustomer: (id: string) => void;
  onChange: (key: string, value: string) => void; onSave: () => void
}
const input = 'h-9 w-full rounded-lg border border-white/15 bg-[#0d0f0d] px-2 text-xs'
export function PriceReviewForm(p: Props) {
  const scope = p.mode === 'standard' ? 'standard' : p.values.plan_scope || ''
  const ready = Boolean(p.productId && scope && (scope !== 'customer' || p.customerId) && p.values.amount.trim() && (p.mode !== 'standard' || p.values.effective_from))
  return <fieldset disabled={p.busy} className="mt-3 space-y-3 rounded-lg border border-white/15 bg-black/10 p-3">
    <p className="text-xs font-semibold">{p.mode === 'standard' ? '標準卸価格の採用' : '価格案の保存（未採用・未提示）'}</p>
    {p.mode === 'plan' && <label className="block text-xs">価格案の対象<select aria-label="価格案の対象" className={input} value={scope} onChange={e => { p.onChange('plan_scope',e.target.value); p.onChange('sales_case_id','') }}>
      <option value="">選択してください（相手・用途未定なら保留）</option><option value="standard">全顧客向けの標準卸価格案</option><option value="customer">特定の取引先への提案予定価格</option>
    </select></label>}
    <label className="block text-xs">商品<select aria-label="価格の反映先商品" className={input} value={p.productId} onChange={e => p.onProduct(e.target.value)}><option value="">商品を選択</option>{p.products.map(r => <option key={r.id} value={r.id}>{r.id} {r.name}</option>)}</select></label>
    {scope === 'customer' && <>
      <label className="block text-xs">提案予定の取引先<select aria-label="提案予定の取引先" className={input} value={p.customerId} onChange={e => {p.onCustomer(e.target.value);p.onChange('sales_case_id','')}}><option value="">取引先を選択</option>{p.customers.map(r => <option key={r.id} value={r.id}>{r.id} {r.name}</option>)}</select></label>
      <label className="block text-xs">関連案件（任意）<select aria-label="価格案の関連案件" className={input} value={p.values.sales_case_id || ''} onChange={e => p.onChange('sales_case_id',e.target.value)}><option value="">取引先の価格案として保存</option>{p.cases.filter(r=>r.customerId===p.customerId).map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
    </>}
    <div className="grid grid-cols-3 gap-2">{[['amount','金額'],['currency','通貨'],['unit','単位']].map(([key,label]) => <label key={key} className="text-xs">{label}<input aria-label={label} className={input} value={p.values[key] || ''} onChange={e=>p.onChange(key,e.target.value)} /></label>)}</div>
    <label className="block text-xs">{p.mode==='standard'?'適用開始日':'予定適用日（任意）'}<input aria-label="価格の適用開始日" type="date" className={input} value={p.values.effective_from || ''} onChange={e=>p.onChange('effective_from',e.target.value)} /></label>
    <label className="block text-xs">数量・包装・送料・税などの条件<textarea aria-label="価格の適用条件" className={input+' h-20 py-2'} value={p.values.conditions || ''} onChange={e=>p.onChange('conditions',e.target.value)} /></label>
    {p.mode==='standard' && <p className="text-xs">現在の標準卸価格：{p.products.find(r=>r.id===p.productId)?.price || '未登録'}<br/>採用後：{p.values.amount || '未入力'} {p.values.currency}/{p.values.unit}</p>}
    <button type="button" disabled={p.busy || !ready} onClick={p.onSave} className="w-full rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-semibold text-[#11150f] disabled:opacity-40">{p.busy?'保存中…':p.mode==='standard'?'標準卸価格として正式反映':'価格案として保存'}</button>
    <p className="text-[10px] text-white/60">{p.mode==='standard'?'商品マスタの現在の標準卸価格を更新し、採用記録を残します。将来日からの価格は価格案として保存してください。':'商品・取引先カードから確認できます。標準卸価格・提示済価格は変わりません。実際に提示した後、提示済価格として別に記録します。'}</p>
  </fieldset>
}
