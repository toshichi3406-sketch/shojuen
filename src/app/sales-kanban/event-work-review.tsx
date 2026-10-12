"use client"
import { EventWorkDraft, WORK_EVENT_STATUSES } from "../../lib/ai-work-event"

export function EventWorkReview({ work, draft, suggestion, disabled, onChange }: {
  work: { id: string; title: string; status: string; nextAction?: string }
  draft: EventWorkDraft
  suggestion?: Record<string, unknown>
  disabled: boolean
  onChange: (value: EventWorkDraft) => void
}) {
  const label = (id: string) => WORK_EVENT_STATUSES.find(row => row.id === id)?.label || id
  const suggested = suggestion && WORK_EVENT_STATUSES.some(row => row.id === suggestion.status)
  const change = (patch: EventWorkDraft) => onChange({ ...draft, ...patch, confirmed: false })
  return <div className="mt-3 space-y-3 rounded-xl border border-emerald-200/15 bg-emerald-200/5 p-3">
    <p className="text-xs font-semibold text-emerald-100">活動後の業務を更新</p>
    <p className="text-xs text-white/70">{work.id} {work.title}</p>
    <p className="text-xs text-white/60">現在の状態：{label(work.status)}</p>
    {suggestion && <div className="space-y-2 rounded-lg bg-black/20 p-2 text-[11px] leading-5 text-amber-100">
      <p>AIの提案（未反映）：{suggested ? label(String(suggestion.status)) : "状態の提案なし"}</p>
      {typeof suggestion.next_action === "string" && <p>次のアクション：{suggestion.next_action}</p>}
      <p>理由：{typeof suggestion.reason === "string" ? suggestion.reason : "根拠を候補本文で確認してください。"}</p>
      <button type="button" disabled={disabled} onClick={() => change({ status: suggested ? String(suggestion.status) : "", updateNextAction: typeof suggestion.next_action === "string", nextAction: typeof suggestion.next_action === "string" ? suggestion.next_action : "" })} className="rounded-full border border-amber-200/25 px-3 py-1 disabled:opacity-40">提案を入力欄へコピー</button>
    </div>}
    <label className="block text-[11px] text-white/60">活動後の状態
      <select aria-label="活動後の業務状態" disabled={disabled} value={draft.status || ""} onChange={e => change({ status: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs text-white">
        <option value="">変更しない（{label(work.status)}）</option>
        {WORK_EVENT_STATUSES.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}
      </select>
    </label>
    <p className="text-[11px] leading-5 text-white/50">現在の次のアクション：{work.nextAction || "未設定"}</p>
    <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" disabled={disabled} checked={Boolean(draft.updateNextAction)} onChange={e => change({ updateNextAction: e.target.checked, nextAction: draft.nextAction ?? work.nextAction ?? "" })} />次のアクションも更新する</label>
    {draft.updateNextAction && <label className="block text-[11px] text-white/60">変更後の次のアクション<textarea aria-label="活動後の次のアクション" disabled={disabled} value={draft.nextAction || ""} onChange={e => change({ nextAction: e.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-[#0d0f0d] p-2 text-xs text-white" /><span>空欄で保存すると次のアクションを解除します。</span></label>}
    <p className="text-xs text-emerald-100">状態：{label(work.status)} → {draft.status ? label(draft.status) : "変更しない"}</p>
    {(draft.status || draft.updateNextAction) && <label className="flex items-start gap-2 text-xs leading-5 text-white/80"><input type="checkbox" disabled={disabled} checked={Boolean(draft.confirmed)} onChange={e => onChange({ ...draft, confirmed: e.target.checked })} className="mt-1" />この活動を根拠に業務を更新することを確認した</label>}
    <p className="text-[10px] leading-4 text-white/45">右の列へ進めるとは限りません。催促なら相手待ちのまま、判断が必要なら要判断へ変更します。案件の営業ステージは変更しません。</p>
  </div>
}
