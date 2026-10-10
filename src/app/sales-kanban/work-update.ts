export const WORK_UPDATE_FIELDS = [
  { key: "title", uiKey: "title", label: "業務件名", aliases: [] },
  { key: "status", uiKey: "status", label: "状態", aliases: [] },
  { key: "assignee", uiKey: "assignee", label: "担当者", aliases: [] },
  { key: "priority", uiKey: "priority", label: "優先度", aliases: [] },
  { key: "due_date", uiKey: "dueDate", label: "期限", aliases: ["dueDate"] },
  { key: "next_action", uiKey: "nextAction", label: "次のアクション", aliases: ["nextAction"] },
  { key: "memo", uiKey: "memo", label: "メモ", aliases: ["note"] },
  { key: "work_type", uiKey: "workType", label: "業務種別", aliases: ["workType"] },
  { key: "country", uiKey: "country", label: "国", aliases: [] },
  { key: "origin_type", uiKey: "originType", label: "接点区分", aliases: ["originType"] },
  { key: "channel", uiKey: "channel", label: "媒体", aliases: [] },
] as const

const STATUS_MAP: Record<string, string> = {
  "未着手": "todo", "確認・準備中": "prep", "対応中": "doing", "相手待ち": "external_wait",
  "社内待ち": "internal_wait", "要判断": "decision", "保留": "hold", "完了": "done",
}
const STATUS_IDS = ["todo", "prep", "doing", "external_wait", "internal_wait", "decision", "hold", "done"]

export function workUpdateValue(value: unknown) {
  return value == null ? "" : String(value)
}

export function buildWorkUpdatePatch(payload: Record<string, unknown>): Record<string, string | null> {
  if (["customer_id", "customerId", "sales_case_id", "salesCaseId", "product_ids", "productIds"].some((key) => Object.prototype.hasOwnProperty.call(payload, key))) {
    throw new Error("業務更新候補では取引先・営業案件・商品の紐付けは変更できません。業務の編集画面で変更してください。")
  }
  const patch: Record<string, string | null> = {}
  for (const field of WORK_UPDATE_FIELDS) {
    const name = [field.key, ...field.aliases].find((key) => Object.prototype.hasOwnProperty.call(payload, key))
    if (!name) continue
    const raw = payload[name]
    if (raw != null && typeof raw !== "string") throw new Error(`${field.label}は文字列で入力してください。`)
    const text = workUpdateValue(raw).trim()
    if (field.key === "title" && !text) throw new Error("業務件名は空にできません。変更しない場合は変更対象から外してください。")
    if (field.key === "status") {
      const status = STATUS_MAP[text] || text
      if (!STATUS_IDS.includes(status)) throw new Error("業務の状態を確認してください。")
      patch[field.key] = status
      continue
    }
    if (field.key === "priority" && text && !["低", "中", "高", "緊急"].includes(text)) throw new Error("優先度を確認してください。")
    if (field.key === "origin_type" && text && !["Outbound", "Inbound", "Referral", "Existing"].includes(text)) throw new Error("接点区分を確認してください。")
    if (field.key === "channel" && text && !["Email", "Instagram DM", "Threads", "LinkedIn", "Web", "電話", "展示会", "紹介", "その他"].includes(text)) throw new Error("媒体を確認してください。")
    if (field.key === "due_date" && text) {
      const date = new Date(text + "T00:00:00Z")
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) throw new Error("期限は有効な日付（YYYY-MM-DD）で入力してください。")
    }
    patch[field.key] = text || null
  }
  if (!Object.keys(patch).length) throw new Error("反映する変更がありません。「候補を編集」で変更する項目を入力してください。")
  return patch
}
