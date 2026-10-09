"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Building2,
  CalendarClock,
  ChevronDown,
  FileText,
  Mail,
  Package,
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

type Tab = "pipeline" | "products"

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
  proposedProductIds?: string[]
  sampleProductIds?: string[]
}

type ProductDoc = {
  id: string
  title: string
  url: string
}

type Product = {
  id: string
  name: string
  producer?: string
  origin?: string
  use?: string
  color?: string
  umami?: string
  bitterness?: string
  aroma?: string
  cost?: string
  price?: string
  moq?: string
  supply?: string
  memo?: string
  docs?: ProductDoc[]
}

const STAGES: { id: Stage; label: string }[] = [
  { id: "lead", label: "候補" },
  { id: "sent", label: "送信済み" },
  { id: "followup", label: "フォロー" },
  { id: "replied", label: "返信あり" },
  { id: "negotiation", label: "商談中" },
  { id: "sample", label: "サンプル" },
  { id: "won", label: "成約" },
  { id: "lost", label: "見送り" },
]

const LEADS_KEY = "shojuen-sales-kanban-v2"
const PRODUCTS_KEY = "shojuen-product-master-v1"

const starterProducts: Product[] = [
  {
    id: "M001",
    name: "サンプル商品 A",
    origin: "未設定",
    use: "ラテ・業務用",
    supply: "確認中",
    memo: "実商品に置き換えてください。",
  },
  {
    id: "M002",
    name: "サンプル商品 B",
    origin: "未設定",
    use: "ストレート・高級帯",
    supply: "確認中",
    memo: "実商品に置き換えてください。",
  },
]

const starterLeads: Lead[] = [
  {
    id: "demo-1",
    company: "サンプルカフェ",
    country: "Singapore",
    category: "カフェ",
    email: "hello@example.com",
    stage: "lead",
    owner: "あかね",
    nextAction: "初回営業メールを送る",
    proposedProductIds: ["M001"],
    sampleProductIds: [],
  },
  {
    id: "demo-2",
    company: "サンプル卸会社",
    country: "Singapore",
    category: "卸・代理店",
    email: "buyer@example.com",
    stage: "sent",
    sentAt: "2026-10-09",
    owner: "あかね",
    nextAction: "4営業日後に返信確認",
    proposedProductIds: ["M001", "M002"],
    sampleProductIds: ["M002"],
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
    category: "カフェ",
    email: "",
    stage,
    owner: "あかね",
    nextAction: "",
    memo: "",
    proposedProductIds: [],
    sampleProductIds: [],
  }
}

function nextProductId(products: Product[]) {
  const max = products.reduce((current, product) => {
    const match = product.id.match(/^M(\d+)$/i)
    return match ? Math.max(current, Number(match[1])) : current
  }, 0)
  return `M${String(max + 1).padStart(3, "0")}`
}

function blankProduct(products: Product[]): Product {
  return {
    id: nextProductId(products),
    name: "",
    producer: "",
    origin: "",
    use: "",
    color: "",
    umami: "",
    bitterness: "",
    aroma: "",
    cost: "",
    price: "",
    moq: "",
    supply: "",
    memo: "",
    docs: [],
  }
}

export default function SalesKanbanPage() {
  const [tab, setTab] = useState<Tab>("pipeline")
  const [leads, setLeads] = useState<Lead[]>(starterLeads)
  const [products, setProducts] = useState<Product[]>(starterProducts)
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("すべて")
  const [productQuery, setProductQuery] = useState("")
  const [editing, setEditing] = useState<Lead | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedLeads = window.localStorage.getItem(LEADS_KEY)
      const legacyLeads = window.localStorage.getItem("shojuen-sales-kanban-v1")
      const savedProducts = window.localStorage.getItem(PRODUCTS_KEY)
      if (savedLeads) setLeads(JSON.parse(savedLeads))
      else if (legacyLeads) setLeads(JSON.parse(legacyLeads))
      if (savedProducts) setProducts(JSON.parse(savedProducts))
    } catch {
      setLeads(starterLeads)
      setProducts(starterProducts)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  }, [leads, products, hydrated])

  const countries = useMemo(
    () => ["すべて", ...Array.from(new Set(leads.map((lead) => lead.country))).sort()],
    [leads]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesCountry = country === "すべて" || lead.country === country
      const productText = (lead.proposedProductIds || [])
        .map((id) => products.find((product) => product.id === id)?.name || id)
        .join(" ")
      const matchesQuery =
        !q ||
        [lead.company, lead.email, lead.category, lead.country, lead.owner, lead.memo, productText]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      return matchesCountry && matchesQuery
    })
  }, [leads, query, country, products])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((product) =>
      [
        product.id,
        product.name,
        product.producer,
        product.origin,
        product.use,
        product.memo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [products, productQuery])

  const stats = useMemo(() => {
    const total = leads.length
    const sent = leads.filter((lead) => lead.stage !== "lead").length
    const replies = leads.filter((lead) =>
      ["replied", "negotiation", "sample", "won"].includes(lead.stage)
    ).length
    const won = leads.filter((lead) => lead.stage === "won").length
    return {
      total,
      sent,
      replies,
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
    if (!editing || !editing.company.trim()) return
    setLeads((current) => {
      const exists = current.some((lead) => lead.id === editing.id)
      return exists
        ? current.map((lead) => (lead.id === editing.id ? editing : lead))
        : [...current, editing]
    })
    setEditing(null)
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingProduct || !editingProduct.name.trim()) return
    setProducts((current) => {
      const exists = current.some((product) => product.id === editingProduct.id)
      return exists
        ? current.map((product) =>
            product.id === editingProduct.id ? editingProduct : product
          )
        : [...current, editingProduct]
    })
    setEditingProduct(null)
  }

  function removeLead(id: string) {
    setLeads((current) => current.filter((lead) => lead.id !== id))
    setEditing(null)
  }

  function removeProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id))
    setLeads((current) =>
      current.map((lead) => ({
        ...lead,
        proposedProductIds: (lead.proposedProductIds || []).filter((item) => item !== id),
        sampleProductIds: (lead.sampleProductIds || []).filter((item) => item !== id),
      }))
    )
    setEditingProduct(null)
  }

  function toggleProductOnLead(productId: string, field: "proposedProductIds" | "sampleProductIds") {
    if (!editing) return
    const current = editing[field] || []
    setEditing({
      ...editing,
      [field]: current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    })
  }

  function addDoc() {
    if (!editingProduct) return
    setEditingProduct({
      ...editingProduct,
      docs: [...(editingProduct.docs || []), { id: uid(), title: "", url: "" }],
    })
  }

  function updateDoc(id: string, key: "title" | "url", value: string) {
    if (!editingProduct) return
    setEditingProduct({
      ...editingProduct,
      docs: (editingProduct.docs || []).map((doc) =>
        doc.id === id ? { ...doc, [key]: value } : doc
      ),
    })
  }

  function removeDoc(id: string) {
    if (!editingProduct) return
    setEditingProduct({
      ...editingProduct,
      docs: (editingProduct.docs || []).filter((doc) => doc.id !== id),
    })
  }

  return (
    <main className="fixed inset-0 z-[200] overflow-hidden bg-[#090a09] text-[#f4f5f2]">
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 bg-[#090a09]/95 px-5 py-4 backdrop-blur md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <span className="inline-block size-2 rounded-full bg-[#66845c]" />
                SHOJUEN SALES OS
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                {tab === "pipeline" ? "営業パイプライン" : "商品マスタ"}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {tab === "pipeline"
                  ? "営業先と提案商品を紐づけて、送信から成約までを追跡。"
                  : "商品番号・特徴・価格・証明書リンクを一元管理。"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  tab === "pipeline"
                    ? setEditing(blankLead())
                    : setEditingProduct(blankProduct(products))
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-medium text-[#11150f] transition hover:bg-white"
              >
                <Plus className="size-4" />
                {tab === "pipeline" ? "営業先を追加" : "商品を追加"}
              </button>
            </div>
          </div>

          <nav className="mt-5 flex gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1">
            <TabButton
              active={tab === "pipeline"}
              onClick={() => setTab("pipeline")}
              icon={<BarChart3 className="size-4" />}
              label="営業パイプライン"
            />
            <TabButton
              active={tab === "products"}
              onClick={() => setTab("products")}
              icon={<Package className="size-4" />}
              label="商品マスタ"
            />
          </nav>

          {tab === "pipeline" ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                <Kpi label="候補" value={stats.total} />
                <Kpi label="送信済み" value={stats.sent} />
                <Kpi label="返信" value={stats.replies} />
                <Kpi label="返信率" value={`${stats.replyRate}%`} />
                <Kpi label="成約" value={stats.won} />
              </div>

              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="会社名・メール・業態・商品番号で検索..."
                />
                <label className="relative min-w-[180px]">
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#111311] px-3 pr-9 text-sm text-white outline-none"
                  >
                    {countries.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                </label>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <SearchBox
                value={productQuery}
                onChange={setProductQuery}
                placeholder="商品番号・商品名・生産者・産地で検索..."
              />
            </div>
          )}
        </header>

        {tab === "pipeline" ? (
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
                    className="flex h-full w-[300px] flex-col rounded-[20px] border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${stageDot(stage.id)}`} />
                        <h2 className="text-sm font-semibold">{stage.label}</h2>
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums text-white/50">
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
                          className={`cursor-grab rounded-2xl border border-white/10 bg-[#111311] p-4 transition hover:-translate-y-0.5 hover:border-white/20 ${draggingId === lead.id ? "opacity-40" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold">{lead.company}</h3>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-white/45">
                                <Building2 className="size-3" />
                                <span>{lead.category}</span>
                                <span>·</span>
                                <span>{lead.country}</span>
                              </div>
                            </div>
                            {lead.positive && (
                              <span className="rounded-full bg-[#dcebd6] px-2 py-1 text-[10px] font-semibold text-[#36522e]">
                                前向き
                              </span>
                            )}
                          </div>

                          {(lead.proposedProductIds || []).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(lead.proposedProductIds || []).map((id) => (
                                <span
                                  key={id}
                                  className="rounded-md border border-[#66845c]/40 bg-[#66845c]/10 px-2 py-1 text-[10px] font-semibold text-[#bcd2b4]"
                                >
                                  {id}
                                </span>
                              ))}
                            </div>
                          )}

                          {lead.email && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
                              <Mail className="size-3.5" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}

                          {lead.nextAction && (
                            <div className="mt-3 rounded-xl bg-white/[0.045] p-2.5">
                              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/35">
                                <CalendarClock className="size-3" />
                                次のアクション
                              </div>
                              <p className="text-xs leading-5 text-white/65">
                                {lead.nextAction}
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                            <span>{lead.owner || "未担当"}</span>
                            <span>{lead.sentAt || "—"}</span>
                          </div>
                        </article>
                      ))}

                      <button
                        onClick={() => setEditing(blankLead(stage.id))}
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 py-3 text-xs font-medium text-white/35 transition hover:border-white/25 hover:bg-white/5 hover:text-white/70"
                      >
                        <Plus className="size-3.5" />
                        追加
                      </button>
                    </div>
                  </section>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const proposedCompanies = leads.filter((lead) =>
                  (lead.proposedProductIds || []).includes(product.id)
                )
                const sampledCompanies = leads.filter((lead) =>
                  (lead.sampleProductIds || []).includes(product.id)
                )
                return (
                  <article
                    key={product.id}
                    onClick={() => setEditingProduct(product)}
                    className="cursor-pointer rounded-[20px] border border-white/10 bg-[#111311] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-md bg-[#66845c]/15 px-2 py-1 text-xs font-bold tracking-[0.08em] text-[#bed2b7]">
                          {product.id}
                        </span>
                        <h2 className="mt-3 text-lg font-semibold">{product.name}</h2>
                        <p className="mt-1 text-xs text-white/45">
                          {[product.producer, product.origin, product.use]
                            .filter(Boolean)
                            .join(" · ") || "詳細未設定"}
                        </p>
                      </div>
                      <Package className="size-5 text-white/25" />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <MiniStat label="提案" value={proposedCompanies.length} />
                      <MiniStat label="サンプル" value={sampledCompanies.length} />
                      <MiniStat label="資料" value={(product.docs || []).length} />
                    </div>

                    {proposedCompanies.length > 0 && (
                      <div className="mt-4 border-t border-white/8 pt-3">
                        <div className="text-[10px] font-semibold tracking-[0.12em] text-white/30">
                          提案先
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
                          {proposedCompanies.map((lead) => lead.company).join(" / ")}
                        </p>
                      </div>
                    )}
                  </article>
                )
              })}

              <button
                onClick={() => setEditingProduct(blankProduct(products))}
                className="min-h-[210px] rounded-[20px] border border-dashed border-white/15 p-5 text-sm text-white/35 transition hover:border-white/25 hover:bg-white/[0.035] hover:text-white/70"
              >
                <Plus className="mx-auto mb-2 size-5" />
                新しい商品を追加
              </button>
            </div>
          </section>
        )}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <form onSubmit={saveLead}>
            <ModalTitle
              eyebrow="営業先詳細"
              title={leads.some((lead) => lead.id === editing.id) ? "営業先を編集" : "新しい営業先"}
              onClose={() => setEditing(null)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="会社名">
                <input
                  autoFocus
                  value={editing.company}
                  onChange={(event) => setEditing({ ...editing, company: event.target.value })}
                  className={inputClass}
                  placeholder="会社名"
                />
              </Field>
              <Field label="ステータス">
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
              <Field label="国">
                <input
                  value={editing.country}
                  onChange={(event) => setEditing({ ...editing, country: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="業態">
                <input
                  value={editing.category}
                  onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                  className={inputClass}
                  placeholder="カフェ / 卸 / 小売"
                />
              </Field>
              <Field label="メール">
                <input
                  type="email"
                  value={editing.email}
                  onChange={(event) => setEditing({ ...editing, email: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="担当">
                <input
                  value={editing.owner || ""}
                  onChange={(event) => setEditing({ ...editing, owner: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="初回送信日">
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
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="次のアクション">
                  <input
                    value={editing.nextAction || ""}
                    onChange={(event) =>
                      setEditing({ ...editing, nextAction: event.target.value })
                    }
                    className={inputClass}
                    placeholder="4営業日後にフォロー"
                  />
                </Field>
              </div>
            </div>

            <ProductPicker
              title="提案した商品"
              products={products}
              selected={editing.proposedProductIds || []}
              onToggle={(id) => toggleProductOnLead(id, "proposedProductIds")}
            />
            <ProductPicker
              title="サンプル送付した商品"
              products={products}
              selected={editing.sampleProductIds || []}
              onToggle={(id) => toggleProductOnLead(id, "sampleProductIds")}
            />

            <div className="mt-4">
              <Field label="メモ">
                <textarea
                  rows={4}
                  value={editing.memo || ""}
                  onChange={(event) => setEditing({ ...editing, memo: event.target.value })}
                  className={`${inputClass} min-h-28 resize-y py-3`}
                  placeholder="商品適性・価格・サンプル希望・会話メモなど"
                />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.positive)}
                onChange={(event) =>
                  setEditing({ ...editing, positive: event.target.checked })
                }
                className="size-4 accent-[#66845c]"
              />
              前向きな返信として記録
            </label>

            <ModalActions
              existing={leads.some((lead) => lead.id === editing.id)}
              onDelete={() => removeLead(editing.id)}
              onCancel={() => setEditing(null)}
            />
          </form>
        </Modal>
      )}

      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)} wide>
          <form onSubmit={saveProduct}>
            <ModalTitle
              eyebrow="商品マスタ"
              title={editingProduct.name || "新しい商品"}
              onClose={() => setEditingProduct(null)}
            />

            <div className="mb-5 rounded-xl border border-[#66845c]/30 bg-[#66845c]/10 p-4">
              <div className="text-[10px] font-semibold tracking-[0.14em] text-[#a9c19f]">
                商品ID
              </div>
              <div className="mt-1 text-2xl font-bold tracking-[0.08em] text-[#d7e5d2]">
                {editingProduct.id}
              </div>
              <p className="mt-1 text-xs text-white/40">
                この番号を営業先に紐づけます。既存IDは変更しない運用がおすすめです。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="商品名">
                <input
                  autoFocus
                  value={editingProduct.name}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, name: event.target.value })
                  }
                  className={inputClass}
                  placeholder="商品名"
                />
              </Field>
              <Field label="生産者 / 仕入先">
                <input
                  value={editingProduct.producer || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, producer: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="産地">
                <input
                  value={editingProduct.origin || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, origin: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="用途">
                <input
                  value={editingProduct.use || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, use: event.target.value })
                  }
                  className={inputClass}
                  placeholder="ラテ / ストレート / 製菓..."
                />
              </Field>
              <Field label="色">
                <input
                  value={editingProduct.color || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, color: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="旨味">
                <input
                  value={editingProduct.umami || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, umami: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="苦味">
                <input
                  value={editingProduct.bitterness || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, bitterness: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="香り">
                <input
                  value={editingProduct.aroma || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, aroma: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="原価">
                <input
                  value={editingProduct.cost || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, cost: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: ¥7,200/kg"
                />
              </Field>
              <Field label="卸価格">
                <input
                  value={editingProduct.price || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, price: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="最低ロット">
                <input
                  value={editingProduct.moq || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, moq: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="供給状況">
                <input
                  value={editingProduct.supply || ""}
                  onChange={(event) =>
                    setEditingProduct({ ...editingProduct, supply: event.target.value })
                  }
                  className={inputClass}
                  placeholder="安定 / 要確認 / 季節限定..."
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="備考">
                  <textarea
                    rows={3}
                    value={editingProduct.memo || ""}
                    onChange={(event) =>
                      setEditingProduct({ ...editingProduct, memo: event.target.value })
                    }
                    className={`${inputClass} min-h-24 resize-y py-3`}
                  />
                </Field>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">証明書・資料</h3>
                  <p className="mt-1 text-xs text-white/40">
                    現段階は非公開ストレージ等のURLを登録。ファイル本体の安全なアップロードはDB化時に追加します。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDoc}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                >
                  <Plus className="size-3.5" />
                  資料追加
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {(editingProduct.docs || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="grid gap-2 rounded-xl border border-white/8 bg-[#0d0f0d] p-3 md:grid-cols-[1fr_1.5fr_auto]"
                  >
                    <input
                      value={doc.title}
                      onChange={(event) => updateDoc(doc.id, "title", event.target.value)}
                      className={inputClass}
                      placeholder="COA / 残留農薬検査 / 規格書..."
                    />
                    <input
                      value={doc.url}
                      onChange={(event) => updateDoc(doc.id, "url", event.target.value)}
                      className={inputClass}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="rounded-xl px-3 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                {(editingProduct.docs || []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-white/30">
                    まだ資料は登録されていません
                  </div>
                )}
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <h3 className="text-sm font-semibold">この商品を提案した営業先</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {leads
                  .filter((lead) => (lead.proposedProductIds || []).includes(editingProduct.id))
                  .map((lead) => (
                    <span
                      key={lead.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
                    >
                      {lead.company}
                    </span>
                  ))}
                {!leads.some((lead) =>
                  (lead.proposedProductIds || []).includes(editingProduct.id)
                ) && <span className="text-xs text-white/30">まだ提案実績なし</span>}
              </div>
            </section>

            <ModalActions
              existing={products.some((product) => product.id === editingProduct.id)}
              onDelete={() => removeProduct(editingProduct.id)}
              onCancel={() => setEditingProduct(null)}
            />
          </form>
        </Modal>
      )}

      <div className="pointer-events-none absolute bottom-3 right-4 hidden items-center gap-2 rounded-full border border-white/10 bg-[#111311]/90 px-3 py-1.5 text-[10px] text-white/40 backdrop-blur md:flex">
        <FileText className="size-3" />
        現在はブラウザ内保存の試作版
      </div>
    </main>
  )
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0d0f0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/25 focus:ring-2 focus:ring-white/5"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/55">{label}</span>
      {children}
    </label>
  )
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
      <Search className="size-4 text-white/35" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
      />
    </label>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-white text-[#11150f]" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
    >
      {icon}
      {label}
    </button>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
      <div className="text-[10px] font-semibold tracking-[0.14em] text-white/35">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-[-0.03em]">{value}</div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.045] p-2.5 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-white/35">{label}</div>
    </div>
  )
}

function ProductPicker({
  title,
  products,
  selected,
  onToggle,
}: {
  title: string
  products: Product[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {products.map((product) => {
          const active = selected.includes(product.id)
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onToggle(product.id)}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${active ? "border-[#66845c] bg-[#66845c]/20 text-[#d6e5d1]" : "border-white/10 bg-white/[0.025] text-white/50 hover:border-white/20"}`}
            >
              <span className="font-bold">{product.id}</span>
              <span className="ml-2">{product.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] border border-white/10 bg-[#111311] p-5 shadow-2xl md:rounded-[26px] md:p-6 ${wide ? "max-w-4xl" : "max-w-2xl"}`}
      >
        {children}
      </div>
    </div>
  )
}

function ModalTitle({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string
  title: string
  onClose: () => void
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <div className="text-xs font-semibold tracking-[0.16em] text-white/35">{eyebrow}</div>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-2 text-white/50 hover:bg-white/10"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}

function ModalActions({
  existing,
  onDelete,
  onCancel,
}: {
  existing: boolean
  onDelete: () => void
  onCancel: () => void
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {existing ? (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
        >
          <Trash2 className="size-4" />
          削除
        </button>
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="rounded-full bg-[#eef3ea] px-5 py-2.5 text-sm font-medium text-[#11150f]"
        >
          保存
        </button>
      </div>
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
