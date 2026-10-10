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
