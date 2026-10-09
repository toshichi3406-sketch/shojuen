"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Building2,
  CalendarClock,
  ChevronDown,
  Mail,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

type Stage =
  | "lead"
  | "sent"
  | "followup"
  | "replied"
  | "negotiation"
  | "sample"
  | "won"
  | "lost"

type Lead = {
  id: string
  company: string
  country: string
  category: string
  email: string
  stage: Stage
  sentAt?: string
  nextAction?: string
  owner?: string
  linkedin?: string
  memo?: string
  positive?: boolean
}

const STAGES: { id: Stage; label: string; short: string }[] = [
  { id: "lead", label: "Lead", short: "Lead" },
  { id: "sent", label: "Email sent", short: "Sent" },
  { id: "followup", label: "Follow-up", short: "Follow" },
  { id: "replied", label: "Replied", short: "Reply" },
  { id: "negotiation", label: "Negotiation", short: "Talk" },
  { id: "sample", label: "Sample", short: "Sample" },
  { id: "won", label: "Won", short: "Won" },
  { id: "lost", label: "Lost", short: "Lost" },
]

const STORAGE_KEY = "shojuen-sales-kanban-v1"

const starterLeads: Lead[] = [
  {
    id: "demo-1",
    company: "Example Cafe",
    country: "Singapore",
    category: "Cafe",
    email: "hello@example.com",
    stage: "lead",
    owner: "Akane",
    nextAction: "Send first outreach",
  },
  {
    id: "demo-2",
    company: "Example Distributor",
    country: "Singapore",
    category: "Distributor",
    email: "buyer@example.com",
    stage: "sent",
    sentAt: "2026-10-09",
    owner: "Akane",
    nextAction: "Check reply in 4 business days",
  },
]

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function blankLead(stage: Stage = "lead"): Lead {
  return {
    id: uid(),
    company: "",
    country: "Singapore",
    category: "Cafe",
    email: "",
    stage,
    owner: "Akane",
    nextAction: "",
    memo: "",
  }
}

export default function SalesKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>(starterLeads)
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("All")
  const [editing, setEditing] = useState<Lead | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setLeads(JSON.parse(saved))
      } catch {
        setLeads(starterLeads)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads, hydrated])

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(leads.map((lead) => lead.country))).sort()],
    [leads]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesCountry = country === "All" || lead.country === country
      const matchesQuery =
        !q ||
        [lead.company, lead.email, lead.category, lead.country, lead.owner, lead.memo]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      return matchesCountry && matchesQuery
    })
  }, [leads, query, country])

  const stats = useMemo(() => {
    const total = leads.length
    const sent = leads.filter((lead) => lead.stage !== "lead").length
    const replies = leads.filter((lead) =>
      ["replied", "negotiation", "sample", "won"].includes(lead.stage)
    ).length
    const positive = leads.filter(
      (lead) => lead.positive || ["negotiation", "sample", "won"].includes(lead.stage)
    ).length
    const won = leads.filter((lead) => lead.stage === "won").length

    return {
      total,
      sent,
      replies,
      positive,
      won,
      replyRate: sent ? Math.round((replies / sent) * 1000) / 10 : 0,
    }
  }, [leads])

  function moveLead(id: string, stage: Stage) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              stage,
              sentAt:
                stage !== "lead" && !lead.sentAt
                  ? new Date().toISOString().slice(0, 10)
                  : lead.sentAt,
            }
          : lead
      )
    )
  }

  function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const company = editing.company.trim()
    if (!company) return

    setLeads((current) => {
      const exists = current.some((lead) => lead.id === editing.id)
      if (exists) {
        return current.map((lead) => (lead.id === editing.id ? editing : lead))
      }
      return [...current, editing]
    })
    setEditing(null)
  }

  function removeLead(id: string) {
    setLeads((current) => current.filter((lead) => lead.id !== id))
    setEditing(null)
  }

  return (
    <main className="fixed inset-0 z-[200] overflow-hidden bg-[#f5f4ef] text-[#151713]">
      <div className="flex h-full flex-col">
        <header className="border-b border-black/10 bg-[#f5f4ef]/95 px-5 py-4 backdrop-blur md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                <span className="inline-block size-2 rounded-full bg-[#4f6f45]" />
                SHOJUEN
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                Sales Pipeline
              </h1>
              <p className="mt-1 text-sm text-black/50">
                Singapore first. Track outreach, replies, samples and wins.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing(blankLead())}
                className="inline-flex items-center gap-2 rounded-full bg-[#20231f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
              >
                <Plus className="size-4" />
                Add lead
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5">
            <Kpi label="Leads" value={stats.total} />
            <Kpi label="Sent" value={stats.sent} />
            <Kpi label="Replies" value={stats.replies} />
            <Kpi label="Reply rate" value={`${stats.replyRate}%`} />
            <Kpi label="Won" value={stats.won} />
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/10 bg-white px-3">
              <Search className="size-4 text-black/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company, email, category..."
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-black/30"
              />
            </label>

            <label className="relative min-w-[180px]">
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-black/10 bg-white px-3 pr-9 text-sm outline-none"
              >
                {countries.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
            </label>
          </div>
        </header>

        <section className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
          <div className="flex h-full min-w-max gap-3">
            {STAGES.map((stage) => {
              const stageLeads = filtered.filter((lead) => lead.stage === stage.id)
              return (
                <section
                  key={stage.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveLead(draggingId, stage.id)
                    setDraggingId(null)
                  }}
                  className="flex h-full w-[300px] flex-col rounded-[20px] border border-black/8 bg-white/55 p-3"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${stageDot(stage.id)}`} />
                      <h2 className="text-sm font-semibold">{stage.label}</h2>
                    </div>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs tabular-nums text-black/50">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {stageLeads.map((lead) => (
                      <article
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggingId(lead.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onClick={() => setEditing(lead)}
                        className={`cursor-grab rounded-2xl border border-black/8 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md ${draggingId === lead.id ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold tracking-[-0.015em]">
                              {lead.company}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-black/45">
                              <Building2 className="size-3" />
                              <span>{lead.category}</span>
                              <span>·</span>
                              <span>{lead.country}</span>
                            </div>
                          </div>
                          {lead.positive && (
                            <span className="rounded-full bg-[#e6f0df] px-2 py-1 text-[10px] font-semibold text-[#426137]">
                              POSITIVE
                            </span>
                          )}
                        </div>

                        {lead.email && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-black/55">
                            <Mail className="size-3.5" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}

                        {lead.nextAction && (
                          <div className="mt-3 rounded-xl bg-[#f5f4ef] p-2.5">
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">
                              <CalendarClock className="size-3" />
                              Next action
                            </div>
                            <p className="text-xs leading-5 text-black/65">{lead.nextAction}</p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-[11px] text-black/35">
                          <span>{lead.owner || "Unassigned"}</span>
                          <span>{lead.sentAt || "—"}</span>
                        </div>
                      </article>
                    ))}

                    <button
                      onClick={() => setEditing(blankLead(stage.id))}
                      className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black/15 py-3 text-xs font-medium text-black/35 transition hover:border-black/25 hover:bg-white hover:text-black/60"
                    >
                      <Plus className="size-3.5" />
                      Add
                    </button>
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      </div>

      {editing && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm md:items-center md:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setEditing(null)
          }}
        >
          <form
            onSubmit={saveLead}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[26px] bg-[#fbfaf6] p-5 shadow-2xl md:rounded-[26px] md:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
                  Lead details
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                  {leads.some((lead) => lead.id === editing.id) ? "Edit lead" : "New lead"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-2 text-black/50 hover:bg-black/5"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company">
                <input
                  autoFocus
                  value={editing.company}
                  onChange={(event) => setEditing({ ...editing, company: event.target.value })}
                  className={inputClass}
                  placeholder="Company name"
                />
              </Field>

              <Field label="Stage">
                <select
                  value={editing.stage}
                  onChange={(event) =>
                    setEditing({ ...editing, stage: event.target.value as Stage })
                  }
                  className={inputClass}
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Country">
                <input
                  value={editing.country}
                  onChange={(event) => setEditing({ ...editing, country: event.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Category">
                <input
                  value={editing.category}
                  onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                  className={inputClass}
                  placeholder="Cafe / Distributor / Retail"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={editing.email}
                  onChange={(event) => setEditing({ ...editing, email: event.target.value })}
                  className={inputClass}
                  placeholder="buyer@company.com"
                />
              </Field>

              <Field label="Owner">
                <input
                  value={editing.owner || ""}
                  onChange={(event) => setEditing({ ...editing, owner: event.target.value })}
                  className={inputClass}
                  placeholder="Akane"
                />
              </Field>

              <Field label="Sent date">
                <input
                  type="date"
                  value={editing.sentAt || ""}
                  onChange={(event) => setEditing({ ...editing, sentAt: event.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="LinkedIn">
                <input
                  value={editing.linkedin || ""}
                  onChange={(event) => setEditing({ ...editing, linkedin: event.target.value })}
                  className={inputClass}
                  placeholder="https://linkedin.com/..."
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Next action">
                  <input
                    value={editing.nextAction || ""}
                    onChange={(event) =>
                      setEditing({ ...editing, nextAction: event.target.value })
                    }
                    className={inputClass}
                    placeholder="Follow up in 4 business days"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Memo">
                  <textarea
                    rows={4}
                    value={editing.memo || ""}
                    onChange={(event) => setEditing({ ...editing, memo: event.target.value })}
                    className={`${inputClass} min-h-28 resize-y py-3`}
                    placeholder="Notes, menu fit, pricing, sample requests..."
                  />
                </Field>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.positive)}
                onChange={(event) =>
                  setEditing({ ...editing, positive: event.target.checked })
                }
                className="size-4 accent-[#4f6f45]"
              />
              Mark as positive response
            </label>

            <div className="mt-6 flex items-center justify-between gap-3">
              {leads.some((lead) => lead.id === editing.id) ? (
                <button
                  type="button"
                  onClick={() => removeLead(editing.id)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#20231f] px-5 py-2.5 text-sm font-medium text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 right-4 hidden items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-1.5 text-[10px] text-black/40 backdrop-blur md:flex">
        <BarChart3 className="size-3" />
        Data is stored in this browser only
      </div>
    </main>
  )
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-black/25 focus:ring-2 focus:ring-black/5"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-black/55">{label}</span>
      {children}
    </label>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-[-0.03em]">{value}</div>
    </div>
  )
}

function stageDot(stage: Stage) {
  switch (stage) {
    case "lead":
      return "bg-slate-400"
    case "sent":
      return "bg-blue-400"
    case "followup":
      return "bg-amber-400"
    case "replied":
      return "bg-violet-400"
    case "negotiation":
      return "bg-orange-400"
    case "sample":
      return "bg-cyan-400"
    case "won":
      return "bg-emerald-500"
    case "lost":
      return "bg-rose-400"
  }
}
