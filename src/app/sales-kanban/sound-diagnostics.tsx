"use client"

import { useEffect, useRef, useState } from "react"
import type { SoundDiagnostics } from "./operation-sounds"

const LABELS = { click: "クリック", drag: "持ち上げ", drop: "置く", saved: "保存完了" }
const ms = (n: number | null) => n === null ? "—" : `${Math.round(n)}ms`

// Opt-in troubleshooting screen. Its timer only updates this small component.
export function OperationSoundDiagnostics({ read }: { read: () => SoundDiagnostics }) {
  const latest = useRef(read)
  latest.current = read
  const [snapshot, setSnapshot] = useState<SoundDiagnostics | null>(null)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("soundDebug") !== "1") return
    const refresh = () => setSnapshot(latest.current())
    refresh()
    const timer = setInterval(refresh, 500)
    return () => clearInterval(timer)
  }, [])
  if (!snapshot) return null
  return (
    <aside aria-label="操作音の診断" className="pointer-events-none fixed bottom-3 right-3 z-[10001] max-w-[95vw] rounded-xl border border-white/20 bg-[#151815]/95 p-3 text-xs text-white shadow-xl">
      <div className="mb-2 font-semibold">操作音の診断 v3</div>
      <div>音声状態: {snapshot.state} ／ 出力遅延の推定: {ms(snapshot.outputMs)}</div>
      <table className="mt-2 text-left">
        <thead><tr><th className="pr-3">操作</th><th className="pr-3">操作→再生指示</th><th className="pr-3">音声起動待ち</th><th>状態</th></tr></thead>
        <tbody>{snapshot.timings.map((row, i) => <tr key={i}><td className="pr-3">{LABELS[row.kind]}</td><td>{ms(row.eventDelayMs)}</td><td>{ms(row.startupMs)}</td><td>{row.state}</td></tr>)}</tbody>
      </table>
      <div className="mt-2 text-white/50">保存完了音は通信後です。出力遅延はブラウザの推定値です。</div>
    </aside>
  )
}
