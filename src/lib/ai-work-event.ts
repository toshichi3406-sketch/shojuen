export const WORK_EVENT_STATUSES = [
  { id: "todo", label: "未着手" }, { id: "prep", label: "確認・準備中" },
  { id: "doing", label: "対応中" }, { id: "external_wait", label: "相手待ち" },
  { id: "internal_wait", label: "社内待ち" }, { id: "decision", label: "要判断" },
  { id: "hold", label: "保留" }, { id: "done", label: "完了" },
] as const

export type EventWorkDraft = { status?: string; updateNextAction?: boolean; nextAction?: string; confirmed?: boolean }
export function eventWorkPatch(draft: EventWorkDraft): Record<string, string | null> | null {
  const patch: Record<string, string | null> = {}
  if (draft.status) {
    if (!WORK_EVENT_STATUSES.some(row => row.id === draft.status)) throw new Error("活動後の業務状態を確認してください。")
    patch.status = draft.status
  }
  if (draft.updateNextAction) patch.next_action = draft.nextAction?.trim() || null
  if (!Object.keys(patch).length) return null
  if (!draft.confirmed) throw new Error("活動後の状態・次のアクションを確認してチェックしてください。")
  return patch
}

export function validateEventWorkPatch(value: unknown): Record<string, string | null> | null {
  if (value == null) return null
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("業務の変更内容を確認してください。")
  const raw = value as Record<string, unknown>
  if (Object.keys(raw).some(key => !["status", "next_action"].includes(key))) throw new Error("活動から更新できるのは業務の状態と次のアクションだけです。")
  if (!Object.keys(raw).length) return null
  if (raw.status != null && (typeof raw.status !== "string" || !WORK_EVENT_STATUSES.some(row => row.id === raw.status))) throw new Error("活動後の業務状態を確認してください。")
  if (Object.hasOwn(raw, "status") && raw.status == null) throw new Error("業務状態は空にできません。")
  if (Object.hasOwn(raw, "next_action") && raw.next_action != null && typeof raw.next_action !== "string") throw new Error("次のアクションは文字列で入力してください。")
  return { ...(Object.hasOwn(raw, "status") ? { status: raw.status as string } : {}), ...(Object.hasOwn(raw, "next_action") ? { next_action: String(raw.next_action || "").trim() || null } : {}) }
}
