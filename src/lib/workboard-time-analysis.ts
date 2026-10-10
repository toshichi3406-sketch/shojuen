export const CASE_STAGES = ["uncontacted","initial_sent","replied","qualifying","quoted","sample_requested","sample_sent","considering","won","lost","hold"] as const
export type StageRecord = {
  kind: "sales_stage_v1"; phase: "pending" | "committed" | "aborted"; from: string | null; to: string;
  channel: string; originType: string; caseType: string
  priorDecision?: { date: string; outcome: string; channel: string; originType: string; caseType: string }
  supersedes?: string
}
export type AnalysisEvent = { id: string; salesCaseId?: string; eventType: string; eventDate: string; channel?: string; note?: string; source?: string }
export type AnalysisCase = { id: string; stage: string; title: string; caseType: string; channel?: string; originType?: string; closedAt?: string; wonAt?: string }

export function parseStageRecord(note?: string): StageRecord | null {
  try {
    const row = JSON.parse(note || "")
    if (row.kind !== "sales_stage_v1" || !["pending","committed","aborted"].includes(row.phase) ||
        !CASE_STAGES.includes(row.to) || !(row.from === null || CASE_STAGES.includes(row.from)) ||
        ["channel","originType","caseType"].some((key) => typeof row[key] !== "string")) return null
    return row
  } catch { return null }
}

export function stageRecordNote(from: string | null, to: string, data: { channel?: string; originType?: string; caseType?: string; priorDecision?: StageRecord["priorDecision"]; supersedes?: string }, phase: StageRecord["phase"] = "committed") {
  return JSON.stringify({ kind: "sales_stage_v1", phase, from, to, channel: data.channel || "", originType: data.originType || "", caseType: data.caseType || "new_business", ...(data.priorDecision ? { priorDecision: data.priorDecision } : {}), ...(data.supersedes ? { supersedes: data.supersedes } : {}) })
}

// Completion is a new event: original history remains immutable.
export function resolvedStageEvents(events: AnalysisEvent[]) {
  const byId = new Map(events.map(event => [event.id, event]))
  const replaced = new Set<string>()
  for (const event of events) {
    const record = parseStageRecord(event.note)
    const pending = record?.supersedes ? byId.get(record.supersedes) : undefined
    const original = parseStageRecord(pending?.note)
    if (event.source === "workboard_auto" && pending?.source === "workboard_auto" &&
        event.salesCaseId === pending.salesCaseId && Date.parse(event.eventDate) === Date.parse(pending.eventDate) &&
        original?.phase === "pending" && record?.phase !== "pending" && record?.from === original.from && record?.to === original.to) {
      replaced.add(pending.id)
    }
  }
  return events.filter(event => !replaced.has(event.id))
}

export function displayActivityNote(note: string, labels: Record<string, string>) {
  const row = parseStageRecord(note)
  if (!row) return note
  const change = row.from === null ? "案件作成: " : `段階変更: ${labels[row.from] || row.from} → `
  return change + (labels[row.to] || row.to) + (row.phase === "pending" ? "（記録未確定）" : row.phase === "aborted" ? "（変更中止）" : "")
}

const time = (value?: string) => value ? Date.parse(value) : NaN
const days = (start: number, end: number) => Math.max(0, (end - start) / 86_400_000)
export function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function stageDurations(cases: AnalysisCase[], events: AnalysisEvent[], now: string) {
  const end = time(now)
  return cases.map((item) => {
    const history = resolvedStageEvents(events).filter((event) => event.salesCaseId === item.id && event.source === "workboard_auto")
      .map((event) => ({ date: time(event.eventDate), record: parseStageRecord(event.note) }))
      .filter((row) => row.record && row.record.phase !== "aborted" && Number.isFinite(row.date) && row.date <= end)
      .sort((a, b) => a.date - b.date)
    const visits: { stage: string; days: number }[] = []
    let entered: number | null = null, stage: string | null = null
    for (const row of history) {
      const record = row.record!
      if (record.phase === "pending") { entered = null; stage = null; continue }
      if (entered !== null && stage !== null && stage === record.from) visits.push({ stage, days: days(entered, row.date) })
      entered = row.date
      stage = record.to
    }
    const known = stage === item.stage && entered !== null
    return { item, enteredAt: known ? new Date(entered!).toISOString() : null, days: known ? days(entered!, end) : null, visits }
  })
}

export const TREND_METRICS = {
  sent: "初回連絡案件数", replied: "反応案件数", replyRate: "返信・反応率",
  won: "成約件数", winRate: "成約率",
}
export type TrendMetric = keyof typeof TREND_METRICS
export function monthlySalesTrend(cases: AnalysisCase[], events: AnalysisEvent[], groupBy: "channel" | "originType", groups: string[], today: string) {
  const end = Date.parse(today + "T23:59:59.999+09:00")
  const year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7)) - 1
  const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(year, month - 11 + i, 1)).toISOString().slice(0, 7))
  const monthOf = (ms: number) => new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 7)
  const media = (event: AnalysisEvent) => event.channel || (["email_sent","reply_received"].includes(event.eventType) ? "Email" : "")
  const validEvents = events.filter((event) => Number.isFinite(time(event.eventDate)) && time(event.eventDate) <= end)
  const rows = [...groups, "未設定"].map((label) => ({ label, months: months.map((month) => ({ month, sent: 0, replied: 0, closed: 0, won: 0, replyRate: null as number | null, winRate: null as number | null })) }))
  const group = (value?: string) => rows.find((row) => row.label === (groups.includes(value || "") ? value : "未設定"))!
  for (const item of cases) {
    const own = validEvents.filter((event) => event.salesCaseId === item.id)
    const contacts = own.filter((event) => ["email_sent","contact_sent"].includes(event.eventType)).sort((a, b) => time(a.eventDate) - time(b.eventDate))
    const first = contacts[0]
    if (first) {
      const row = group(groupBy === "channel" ? item.channel : item.originType).months.find((row) => row.month === monthOf(time(first.eventDate)))
      if (row) {
        row.sent++
        const reacted = own.some((event) => event.eventType === "reply_received" &&
          contacts.some((contact) => media(contact) && media(contact) === media(event) && time(contact.eventDate) <= time(event.eventDate)))
        if (reacted) row.replied++
      }
    }
    const decisions = own.filter((event) => event.source === "workboard_auto")
      .map((event) => ({ date: time(event.eventDate), record: parseStageRecord(event.note) }))
      .filter((row) => row.record?.phase === "committed")
      .flatMap((row) => {
        const record = row.record!
        const result = record.caseType === "new_business" && ["won","lost"].includes(record.to) ? [{ date: row.date, record }] : []
        const prior = record.priorDecision
        if (prior?.caseType === "new_business" && ["won","lost"].includes(prior.outcome) && Number.isFinite(time(prior.date)) && time(prior.date) <= row.date) {
          result.push({ date: time(prior.date), record: { ...record, to: prior.outcome, channel: prior.channel, originType: prior.originType } })
        }
        return result
      })
      .sort((a, b) => a.date - b.date)
    const decision = decisions[0]
    // Existing cases may have a saved decision date but no stage history.
    const fallback = item.caseType === "new_business" && ["won","lost"].includes(item.stage) ? time(item.closedAt || (item.stage === "won" ? item.wonAt : undefined)) : NaN
    const closed = decision?.date ?? fallback
    if (Number.isFinite(closed) && closed <= end) {
      const row = group(decision ? decision.record![groupBy] : item[groupBy]).months.find((row) => row.month === monthOf(closed))
      if (row) { row.closed++; if ((decision?.record?.to || item.stage) === "won") row.won++ }
    }
  }
  for (const row of rows) for (const point of row.months) {
    point.replyRate = point.sent ? point.replied / point.sent * 100 : null
    point.winRate = point.closed ? point.won / point.closed * 100 : null
  }
  return rows
}
