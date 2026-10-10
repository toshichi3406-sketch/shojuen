import { useState } from "react"
import { AnalysisCase, AnalysisEvent, median, monthlySalesTrend, stageDurations, TREND_METRICS, TrendMetric } from "../../lib/workboard-time-analysis"

type OrderSummary = { orderDate: string; orderType: string; orderStatus: string }
export type MonthlyOrderRow = { month: string; first: number; repeat: number }

export function monthlyOrderRows(orders: OrderSummary[], today: string): MonthlyOrderRow[] {
  const year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7)) - 1
  const rows = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 11 + index, 1))
    return { month: date.toISOString().slice(0, 7), first: 0, repeat: 0 }
  })
  const byMonth = new Map(rows.map((row) => [row.month, row]))
  for (const order of orders) {
    if (order.orderStatus === "cancelled" || !/^\d{4}-\d{2}-\d{2}$/.test(order.orderDate)) continue
    const date = new Date(order.orderDate + "T00:00:00Z")
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== order.orderDate || order.orderDate > today) continue
    const row = byMonth.get(order.orderDate.slice(0, 7))
    if (!row) continue
    if (order.orderType === "first") row.first++
    if (order.orderType === "repeat") row.repeat++
  }
  return rows
}

type StageRow = { id: string; label: string; count: number }
type ComparisonRow = {
  label: string; caseCount: number; sentCount: number; repliedCount: number;
  closedCount: number; wonCount: number; replyRate: string; winRate: string
}
const panel = "rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:p-5"

const dayLabel = (value: number | null) => value === null ? "不明" : Math.round(value * 10) / 10 + "日"
export function StageTimeAnalysis({ cases, events, labels, now, onOpen }: {
  cases: AnalysisCase[]; events: AnalysisEvent[]; labels: Record<string, string>; now: string; onOpen: (id: string) => void
}) {
  const [threshold, setThreshold] = useState(14)
  const durations = stageDurations(cases, events, now)
  const active = durations.filter((row) => !["won","lost"].includes(row.item.stage))
  const unknown = active.filter((row) => row.days === null).length
  const rows = Object.entries(labels).filter(([id]) => !["won","lost"].includes(id)).map(([id, label]) => {
    const current = active.filter((row) => row.item.stage === id)
    const known = current.flatMap((row) => row.days === null ? [] : [row.days])
    const completed = durations.flatMap((row) => row.visits.filter((visit) => visit.stage === id).map((visit) => visit.days))
    return { id, label, count: current.length, median: median(known), unknown: current.length - known.length,
      longest: known.length ? Math.max(...known) : null, completedMedian: median(completed), completedCount: completed.length }
  })
  const max = Math.max(1, ...rows.map((row) => row.median || 0))
  const stalled = active.filter((row) => row.days !== null && row.days >= threshold).sort((a, b) => b.days! - a.days!)
  return (
    <section className={panel + " mb-4"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-base font-semibold">どの段階に時間がかかっているか</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">記録された段階開始からの経過日数。成約・失注は現在の滞在集計から除外します。</p></div>
        <label className="text-xs text-white/60">長期滞在の目安
          <select value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="ml-2 rounded-lg border border-white/15 bg-[#111311] p-2">
            {[7,14,30,60].map((value) => <option key={value} value={value}>{value}日以上</option>)}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs leading-5 text-amber-100/60">開始日が不明な案件は {unknown}件。更新日時から推測せず、日数の集計から除外します。段階変更後から記録が始まります。</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold text-white/65">現在の滞在日数の中央値</h3>
          <ul className="space-y-3">{rows.map((row) => (
            <li key={row.id} className="grid grid-cols-[115px_1fr_60px] items-center gap-2 text-xs">
              <span className="text-white/60">{row.label}</span>
              <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-amber-300/70" style={{ width: `${(row.median || 0) / max * 100}%` }} /></div>
              <span className="text-right text-white/70">{row.count ? dayLabel(row.median) : "対象なし"}</span>
            </li>
          ))}</ul>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-xs">
            <caption className="mb-3 text-left text-xs font-semibold text-white/65">現在の滞在と、通過済み案件の所要日数</caption>
            <thead className="text-white/40"><tr><th className="p-2 text-left">段階</th><th className="p-2">現在</th><th className="p-2">最長</th><th className="p-2">不明</th><th className="p-2">通過済み中央値</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-white/10 text-white/65">
              <th className="p-2 text-left font-medium">{row.label}</th><td className="p-2 text-center">{row.count}件</td>
              <td className="p-2 text-center">{row.count ? dayLabel(row.longest) : "—"}</td><td className="p-2 text-center">{row.unknown}件</td>
              <td className="p-2 text-center">{row.completedCount ? dayLabel(row.completedMedian) + " / " + row.completedCount + "回" : "—"}</td>
            </tr>)}</tbody>
          </table>
          <p className="mt-2 text-[10px] leading-5 text-white/35">通過済みは開始・終了が記録された区間のみ。同じ案件の再訪は別の区間として扱います。保留期間も別段階です。</p>
        </div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold">{threshold}日以上滞在している案件 <span className="text-white/40">({stalled.length})</span></h3>
        {stalled.length === 0 ? <p className="mt-2 text-xs text-white/40">記録がある案件では、該当する長期滞在はありません。</p> :
          <ul className="mt-3 grid gap-2 md:grid-cols-2">{stalled.map((row) => <li key={row.item.id}>
            <button type="button" onClick={() => onOpen(row.item.id)} className="w-full rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-3 text-left hover:bg-amber-200/10">
              <span className="block break-words text-xs font-medium">{row.item.title}</span><span className="mt-1 block text-[10px] text-amber-100/70">{labels[row.item.stage]} / {dayLabel(row.days)} / 案件を開く</span>
            </button>
          </li>)}</ul>}
      </div>
    </section>
  )
}

const lineColors = ["#38bdf8","#34d399","#fbbf24","#c084fc","#fb7185","#2dd4bf","#fb923c","#818cf8","#a3e635","#e2e8f0"]
export function MonthlySalesChart({ cases, events, groupBy, groups, today }: {
  cases: AnalysisCase[]; events: AnalysisEvent[]; groupBy: "channel" | "originType"; groups: string[]; today: string
}) {
  const [metric, setMetric] = useState<TrendMetric>("sent")
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const rows = monthlySalesTrend(cases, events, groupBy, groups, today)
  const available = rows.filter((row) => row.months.some((point) => point.sent || point.closed))
  const shown = available.filter((row) => enabled[row.label] !== false)
  const rate = metric === "replyRate" || metric === "winRate"
  const ceiling = rate ? 100 : Math.max(1, ...shown.flatMap((row) => row.months.map((point) => point[metric] || 0)))
  const x = (i: number) => 48 + i * 58, y = (value: number) => 205 - value / ceiling * 170
  const pointLabel = (point: typeof rows[number]["months"][number]) => {
    const value = point[metric]
    return value === null ? "対象なし" : rate ? `${Math.round(value)}%（${metric === "replyRate" ? point.replied + "/" + point.sent : point.won + "/" + point.closed}件）` : value + "件"
  }
  return (
    <section className="mb-4 rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">営業方法の月次推移</h3>
        <label className="text-xs text-white/60">指標 <select className="ml-2 rounded-lg border border-white/15 bg-[#111311] p-2" value={metric} onChange={(event) => setMetric(event.target.value as TrendMetric)}>
          {Object.entries(TREND_METRICS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/45">直近12か月。当月は途中経過。連絡・反応は初回連絡月ごとの案件群を集計し、その後に同じ媒体で反応があった案件を今日まで追跡します。最近の月ほど反応を待つ期間が短い点に注意してください。</p>
      <p className="mt-1 text-[10px] leading-5 text-white/35">成約は新規営業の初回決着月で集計。記録開始前は保存済みの決着日を使い、日付不明は除外します。連絡側の分類は現在の案件の媒体・接点区分、段階記録のある決着側は決着時の分類を使います。</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {available.map((row) => <label key={row.label} className="flex items-center gap-1.5 text-xs text-white/65"><input type="checkbox" checked={enabled[row.label] !== false} onChange={(event) => setEnabled((old) => ({ ...old, [row.label]: event.target.checked }))} /><span style={{ color: lineColors[rows.indexOf(row) % lineColors.length] }}>●</span>{row.label}</label>)}
      </div>
      {available.length === 0 ? <p className="mt-4 text-xs text-white/50">対象期間の連絡・決着記録はありません。</p> : shown.length === 0 ? <p className="mt-4 text-xs text-white/50">比較する分類を選んでください。</p> : (
        <>
          <div className="mt-4 overflow-x-auto">
            <svg viewBox="0 0 740 240" className="min-w-[600px] w-full" role="img" aria-label={TREND_METRICS[metric] + "の月次推移。下の表に数値があります。"}>
              <title>{TREND_METRICS[metric] + "の月次推移"}</title>
              {[0,0.5,1].map((ratio) => <g key={ratio}><line x1="48" x2="686" y1={y(ceiling * ratio)} y2={y(ceiling * ratio)} stroke="#ffffff18" /><text x="40" y={y(ceiling * ratio) + 4} textAnchor="end" fontSize="10" fill="#ffffff70">{rate ? ceiling * ratio + "%" : Math.round(ceiling * ratio * 10) / 10}</text></g>)}
              {rows[0].months.map((point, i) => <text key={point.month} x={x(i)} y="228" textAnchor="middle" fontSize="10" fill="#ffffff70">{point.month.slice(2).replace("-", "/")}</text>)}
              {shown.map((row) => {
                const color = lineColors[rows.indexOf(row) % lineColors.length]
                let path = "", connect = false
                row.months.forEach((point, i) => { const value = point[metric]; if (value === null) { connect = false; return } path += `${connect ? "L" : "M"}${x(i)},${y(value)} `; connect = true })
                return <g key={row.label}><path d={path} fill="none" stroke={color} strokeWidth="2" />
                  {row.months.map((point, i) => point[metric] === null ? null : <circle key={point.month} cx={x(i)} cy={y(point[metric]!)} r="3.5" fill={color}><title>{row.label + " / " + point.month + " / " + pointLabel(point)}</title></circle>)}
                </g>
              })}
            </svg>
          </div>
          <details className="mt-3"><summary className="cursor-pointer text-xs text-white/60">月別の数値・母数を見る</summary>
            <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[1000px] text-xs">
              <caption className="sr-only">{TREND_METRICS[metric]}の月別数値と母数</caption>
              <thead><tr><th className="p-2 text-left">分類</th>{rows[0].months.map((point) => <th key={point.month} className="p-2">{point.month}</th>)}</tr></thead>
              <tbody>{shown.map((row) => <tr key={row.label} className="border-t border-white/10 text-white/65"><th className="p-2 text-left">{row.label}</th>{row.months.map((point) => <td key={point.month} className="p-2 text-center">{pointLabel(point)}</td>)}</tr>)}</tbody>
            </table></div>
          </details>
        </>
      )}
    </section>
  )
}

export function AnalysisOverview({ stages, months }: { stages: StageRow[]; months: MonthlyOrderRow[] }) {
  const stageMax = Math.max(1, ...stages.map((row) => row.count))
  const monthMax = Math.max(1, ...months.map((row) => row.first + row.repeat))
  const totalCases = stages.reduce((sum, row) => sum + row.count, 0)
  const totalOrders = months.reduce((sum, row) => sum + row.first + row.repeat, 0)
  return (
    <div className="mb-4 grid items-start gap-4 lg:grid-cols-2">
      <section className={panel} aria-label="案件の段階別件数">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-base font-semibold">案件はどこにあるか</h2><p className="mt-1 text-xs leading-5 text-white/45">現在の段階別件数。成約・失注・保留を含む全案件。</p></div>
          <span className="shrink-0 text-sm text-white/60">{totalCases}件</span>
        </div>
        <p className="mt-2 text-[10px] leading-5 text-white/35">段階を通過した累計ではありません。件数が多い段階を確認し、案件ページで次の対応を検討します。</p>
        {totalCases === 0 && <p className="mt-3 text-xs text-white/50">案件を登録するとグラフに反映されます。</p>}
        <ul className="mt-4 space-y-3">
          {stages.map((row) => (
            <li key={row.id} className="grid grid-cols-[115px_1fr_36px] items-center gap-2 text-xs">
              <span className="text-white/65">{row.label}</span>
              <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${row.id === "won" ? "bg-emerald-400/80" : row.id === "lost" ? "bg-rose-400/65" : row.id === "hold" ? "bg-white/25" : "bg-sky-400/70"}`} style={{ width: `${row.count / stageMax * 100}%` }} /></div>
              <span className="text-right tabular-nums text-white/75">{row.count}件</span>
            </li>
          ))}
        </ul>
      </section>
      <section className={panel} aria-label="月別の初回・リピート受注件数">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-base font-semibold">取引は継続しているか</h2><p className="mt-1 text-xs leading-5 text-white/45">直近12か月の受注日別件数。当月は今日まで。</p></div>
          <span className="shrink-0 text-sm text-white/60">{totalOrders}件</span>
        </div>
        <p className="mt-2 text-[10px] leading-5 text-white/35">取消・未来日・日付未設定の受注は除外。金額や継続率ではなく、初回とリピートの件数です。</p>
        <div className="mt-3 flex gap-4 text-[10px] text-white/60"><span><span className="mr-1 inline-block size-2 rounded-sm bg-sky-400" />初回</span><span><span className="mr-1 inline-block size-2 rounded-sm bg-emerald-400" />リピート</span></div>
        {totalOrders === 0 && <p className="mt-3 text-xs text-white/50">対象期間の受注はありません。</p>}
        <ul className="mt-4 space-y-3">
          {months.map((row) => (
            <li key={row.month} className="grid grid-cols-[58px_1fr_96px] items-center gap-2 text-xs">
              <span className="text-white/60">{row.month.replace("-", "/")}</span>
              <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-sky-400/80" style={{ width: `${row.first / monthMax * 100}%` }} />
                <div className="h-full bg-emerald-400/80" style={{ width: `${row.repeat / monthMax * 100}%` }} />
              </div>
              <span className="text-right tabular-nums text-white/70">初回{row.first} / 再{row.repeat}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function ComparisonChart({ rows }: { rows: ComparisonRow[] }) {
  const visible = rows.filter((row) => row.caseCount > 0)
  return (
    <section className="mb-4 rounded-xl border border-white/10 bg-black/10 p-4" aria-label="媒体・接点区分別の反応率と成約率">
      <h3 className="text-sm font-semibold">どの営業方法に力を入れるか</h3>
      <p className="mt-1 text-xs leading-5 text-white/45">棒の長さは0〜100％。母数の少ない分類は、率だけで判断せず件数も確認してください。</p>
      {visible.length === 0 ? <p className="mt-4 text-xs text-white/50">案件を登録すると比較できます。</p> : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((row) => (
            <div key={row.label} className="rounded-xl border border-white/10 p-3">
              <div className="mb-3 flex justify-between text-xs"><span className="font-semibold">{row.label}</span><span className="text-white/40">案件 {row.caseCount}件</span></div>
              {[
                { label: "返信・反応", rate: row.replyRate, numerator: row.repliedCount, denominator: row.sentCount, color: "bg-sky-400/80" },
                { label: "新規営業成約", rate: row.winRate, numerator: row.wonCount, denominator: row.closedCount, color: "bg-emerald-400/80" },
              ].map((metric) => (
                <div key={metric.label} className="mt-3">
                  <div className="mb-1 flex justify-between gap-2 text-[10px] text-white/60"><span>{metric.label}</span><span>{metric.rate}（{metric.numerator} / {metric.denominator}件）</span></div>
                  <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.denominator ? metric.numerator / metric.denominator * 100 : 0}%` }} /></div>
                  {metric.denominator === 0 && <p className="mt-1 text-[10px] text-white/30">集計対象なし</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
