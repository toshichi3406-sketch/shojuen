import { CASE_STAGES } from "./workboard-time-analysis"

export const SALES_CASE_UPDATE_FIELDS = [
  { key: "title", uiKey: "title", label: "案件名", aliases: [] },
  { key: "theme", uiKey: "theme", label: "テーマ", aliases: [] },
  { key: "stage", uiKey: "stage", label: "段階", aliases: [] },
  { key: "heat", uiKey: "heat", label: "温度感", aliases: [] },
  { key: "assignee", uiKey: "assignee", label: "担当者", aliases: [] },
  { key: "next_follow_up_date", uiKey: "nextFollowUpDate", label: "次回フォロー日", aliases: ["nextFollowUpDate"] },
  { key: "next_action", uiKey: "nextAction", label: "次のアクション", aliases: ["nextAction"] },
  { key: "close_reason", uiKey: "closeReason", label: "決着理由", aliases: ["closeReason"] },
  { key: "close_note", uiKey: "closeNote", label: "決着メモ", aliases: ["closeNote"] },
  { key: "case_type", uiKey: "caseType", label: "案件区分", aliases: ["caseType"] },
  { key: "origin_type", uiKey: "originType", label: "接点区分", aliases: ["originType"] },
  { key: "channel", uiKey: "channel", label: "媒体", aliases: [] },
] as const
const stageLabels = ["未接触","初回送信","返信あり","条件確認中","見積提示","サンプル要求あり","サンプル送付","検討中","成約","失注","保留"]
export const salesCaseUpdateValue = (value: unknown) => value == null ? "" : String(value)

export function buildSalesCaseUpdatePatch(payload: Record<string, unknown>) {
  if (["customer_id","customerId","product_ids","productIds","work_item_id","workItemId","won_at","wonAt","closed_at","closedAt"].some((key) => Object.prototype.hasOwnProperty.call(payload, key))) {
    throw new Error("取引先・商品・業務の紐づけや決着日時は、この候補では変更できません。決着日時は段階変更の反映時に記録します。")
  }
  const patch: Record<string, string | null> = {}
  for (const field of SALES_CASE_UPDATE_FIELDS) {
    const names = [field.key, ...field.aliases].filter((key) => Object.prototype.hasOwnProperty.call(payload, key))
    if (!names.length) continue
    if (names.length > 1) throw new Error(field.label + "を複数のキーで指定しないでください。")
    const raw = payload[names[0]]
    if (raw !== null && typeof raw !== "string") throw new Error(field.label + "は文字列で指定してください。")
    let value = salesCaseUpdateValue(raw).trim()
    if (field.key === "stage" && stageLabels.includes(value)) value = CASE_STAGES[stageLabels.indexOf(value)]
    if (["title","theme","stage","assignee","case_type","heat"].includes(field.key) && !value) throw new Error(field.label + "は空欄にできません。")
    if (field.key === "stage" && !CASE_STAGES.some((stage) => stage === value)) throw new Error("案件の段階が不正です。")
    if (field.key === "heat" && !["A","B","C"].includes(value)) throw new Error("温度感はA/B/Cで指定してください。")
    if (field.key === "case_type" && !["new_business","existing_followup"].includes(value)) throw new Error("案件区分が不正です。")
    if (field.key === "origin_type" && value && !["Outbound","Inbound","Referral","Existing"].includes(value)) throw new Error("接点区分が不正です。")
    if (field.key === "channel" && value && !["Email","Instagram DM","Threads","LinkedIn","Web","電話","展示会","紹介","その他"].includes(value)) throw new Error("媒体が不正です。")
    if (field.key === "next_follow_up_date" && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value + "T00:00:00Z")) || new Date(value + "T00:00:00Z").toISOString().slice(0,10) !== value)) throw new Error("次回フォロー日を有効なYYYY-MM-DDで指定してください。")
    patch[field.key] = value || null
  }
  if (!Object.keys(patch).length) throw new Error("変更する案件の項目を1つ以上指定してください。")
  return patch
}
