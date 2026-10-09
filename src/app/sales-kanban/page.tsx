"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Bot,
  Building2,
  CalendarClock,
  ChevronDown,
  FileText,
  Mail,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react"

type Status =
  | "todo"
  | "prep"
  | "doing"
  | "external_wait"
  | "internal_wait"
  | "decision"
  | "hold"
  | "done"

type Tab = "work" | "customers" | "products" | "ai"

type AuthState = {
  loading: boolean
  configured: boolean
  authenticated: boolean
  user?: { email?: string; role?: string; displayName?: string }
}


type AiImportBatch = {
  id: string
  source: string
  source_session_id?: string | null
  session_title?: string | null
  source_timestamp?: string | null
  summary?: string | null
  status: string
  created_at: string
}

type AiImportCandidate = {
  id: string
  batch_id: string
  candidate_type: string
  target_id?: string | null
  title?: string | null
  payload?: Record<string, unknown>
  confidence?: number | null
  status: "pending" | "approved" | "rejected" | "needs_edit"
  decision_note?: string | null
  created_at: string
}

type WorkItem = {
  id: string
  title: string
  status: Status
  customerId?: string
  workType?: string
  assignee?: string
  priority?: "低" | "中" | "高" | "緊急"
  dueDate?: string
  nextAction?: string
  country?: string
  originType?: "Outbound" | "Inbound" | "Referral" | "Existing"
  channel?: string
  productIds?: string[]
  memo?: string
}

type CustomerPrice = {
  id: string
  productId: string
  price: string
  currency: string
  unit: string
  moq?: string
  shipping?: string
  payment?: string
  effectiveFrom?: string
  locked: boolean
}

type Customer = {
  id: string
  name: string
  country?: string
  category?: string
  contact?: string
  email?: string
  phone?: string
  instagram?: string
  linkedin?: string
  note?: string
  prices?: CustomerPrice[]
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

const STATUSES: { id: Status; label: string }[] = [
  { id: "todo", label: "未着手" },
  { id: "prep", label: "確認・準備中" },
  { id: "doing", label: "対応中" },
  { id: "external_wait", label: "相手待ち" },
  { id: "internal_wait", label: "社内待ち" },
  { id: "decision", label: "要判断" },
  { id: "hold", label: "保留" },
  { id: "done", label: "完了" },
]

const WORK_TYPES = ["営業", "仕入", "商品開発", "物流", "証明書", "HP", "経理", "国内卸", "海外", "その他"]
const CHANNELS = ["Email", "Instagram DM", "Threads", "LinkedIn", "Web", "電話", "展示会", "紹介", "その他"]
const ORIGINS: WorkItem["originType"][] = ["Outbound", "Inbound", "Referral", "Existing"]

const WORK_KEY = "shojuen-workboard-v1"
const CUSTOMER_KEY = "shojuen-customer-master-v1"
const PRODUCT_KEY = "shojuen-product-master-v1"

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function nextId<T extends { id: string }>(items: T[], prefix: string) {
  const max = items.reduce((current, item) => {
    const match = item.id.match(new RegExp("^" + prefix + "(\\d+)$", "i"))
    return match ? Math.max(current, Number(match[1])) : current
  }, 0)
  return `${prefix}${String(max + 1).padStart(3, "0")}`
}

const starterProducts: Product[] = [
  { id: "M001", name: "サンプル商品 A", use: "ラテ・業務用", supply: "確認中" },
  { id: "M002", name: "サンプル商品 B", use: "ストレート・高級帯", supply: "確認中" },
]

const starterCustomers: Customer[] = [
  {
    id: "C001",
    name: "サンプル取引先",
    country: "Singapore",
    category: "カフェ",
    email: "hello@example.com",
    prices: [
      {
        id: "P001",
        productId: "M001",
        price: "8500",
        currency: "JPY",
        unit: "kg",
        moq: "5kg",
        shipping: "別途",
        payment: "要確認",
        effectiveFrom: "2026-10-01",
        locked: true,
      },
    ],
  },
]

const starterWork: WorkItem[] = [
  {
    id: "W001",
    title: "サンプル取引先への商品提案",
    status: "doing",
    customerId: "C001",
    workType: "海外",
    assignee: "あかね",
    priority: "中",
    country: "Singapore",
    originType: "Outbound",
    channel: "Email",
    productIds: ["M001"],
    nextAction: "提案内容を確認して送付",
  },
]

export default function SalesKanbanPage() {
  const [tab, setTab] = useState<Tab>("work")
  const [work, setWork] = useState<WorkItem[]>(starterWork)
  const [customers, setCustomers] = useState<Customer[]>(starterCustomers)
  const [products, setProducts] = useState<Product[]>(starterProducts)
  const [aiBatches, setAiBatches] = useState<AiImportBatch[]>([])
  const [aiCandidates, setAiCandidates] = useState<AiImportCandidate[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [workQuery, setWorkQuery] = useState("")
  const [customerQuery, setCustomerQuery] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [auth, setAuth] = useState<AuthState>({ loading: true, configured: false, authenticated: false })
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginBusy, setLoginBusy] = useState(false)

  useEffect(() => {
    fetch("/api/workboard/auth/session", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        setAuth({
          loading: false,
          configured: Boolean(data.configured),
          authenticated: Boolean(data.authenticated),
          user: data.user,
        })
      })
      .catch(() => setAuth({ loading: false, configured: false, authenticated: false }))
  }, [])


  useEffect(() => {
    if (!(auth.configured && auth.authenticated)) return
    setAiLoading(true)
    fetch("/api/workboard/ai-import", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "AI取込候補を読み込めませんでした。")
        setAiBatches(Array.isArray(data.batches) ? data.batches : [])
        setAiCandidates(Array.isArray(data.candidates) ? data.candidates : [])
      })
      .catch((error) => console.error(error))
      .finally(() => setAiLoading(false))
  }, [auth.configured, auth.authenticated])

  useEffect(() => {
    if (auth.loading) return

    if (auth.configured && auth.authenticated) {
      fetch("/api/workboard/data", { cache: "no-store" })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.error || "共有DBを読み込めませんでした。")
          setWork(Array.isArray(data.work) ? data.work : [])
          setCustomers(Array.isArray(data.customers) ? data.customers : [])
          setProducts(Array.isArray(data.products) ? data.products : [])
          setHydrated(true)
        })
        .catch((error) => {
          console.error(error)
          setHydrated(true)
        })
      return
    }

    try {
      const savedWork = window.localStorage.getItem(WORK_KEY)
      const savedCustomers = window.localStorage.getItem(CUSTOMER_KEY)
      const savedProducts = window.localStorage.getItem(PRODUCT_KEY)
      if (savedWork) setWork(JSON.parse(savedWork))
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
      if (savedProducts) setProducts(JSON.parse(savedProducts))
    } catch {
      setWork(starterWork)
      setCustomers(starterCustomers)
      setProducts(starterProducts)
    }
    setHydrated(true)
  }, [auth.loading, auth.configured, auth.authenticated])

  useEffect(() => {
    if (!hydrated || (auth.configured && auth.authenticated)) return
    window.localStorage.setItem(WORK_KEY, JSON.stringify(work))
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers))
    window.localStorage.setItem(PRODUCT_KEY, JSON.stringify(products))
  }, [work, customers, products, hydrated, auth.configured, auth.authenticated])

  async function saveShared(type: "work" | "customer" | "product", data: WorkItem | Customer | Product) {
    if (!(auth.configured && auth.authenticated)) return
    const response = await fetch("/api/workboard/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "共有DBへの保存に失敗しました。")
  }

  async function deleteShared(type: "work" | "customer" | "product", id: string) {
    if (!(auth.configured && auth.authenticated)) return
    const response = await fetch(
      `/api/workboard/data?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    )
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "共有DBからの削除に失敗しました。")
  }


  async function updateAiCandidate(id: string, status: AiImportCandidate["status"]) {
    const response = await fetch("/api/workboard/ai-import", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "AI取込候補を更新できませんでした。")
    setAiCandidates((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  function aiCandidateLabel(type: string) {
    const labels: Record<string, string> = {
      new_work: "新規業務",
      work_update: "業務更新",
      work_event: "業務履歴",
      customer_update: "取引先更新",
      product_update: "商品更新",
      price_candidate: "価格候補",
      decision: "要判断",
    }
    return labels[type] || type
  }

  const pendingAiCount = aiCandidates.filter((item) => item.status === "pending").length

  const filteredWork = useMemo(() => {
    const q = workQuery.trim().toLowerCase()
    if (!q) return work
    return work.filter((item) => {
      const customer = customers.find((c) => c.id === item.customerId)
      return [
        item.title,
        customer?.name,
        item.workType,
        item.assignee,
        item.channel,
        item.originType,
        item.country,
        item.memo,
        ...(item.productIds || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [work, customers, workQuery])

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((customer) =>
      [customer.id, customer.name, customer.country, customer.category, customer.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [customers, customerQuery])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((product) =>
      [product.id, product.name, product.producer, product.origin, product.use, product.memo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [products, productQuery])

  const activeCount = work.filter((item) => !["hold", "done"].includes(item.status)).length
  const waitingCount = work.filter((item) => ["external_wait", "internal_wait"].includes(item.status)).length
  const decisionCount = work.filter((item) => item.status === "decision").length
  const dueCount = work.filter((item) => item.dueDate && item.status !== "done").length

  async function moveWork(id: string, status: Status) {
    const currentItem = work.find((item) => item.id === id)
    if (!currentItem) return
    const updated = { ...currentItem, status }
    setWork((current) => current.map((item) => (item.id === id ? updated : item)))
    try {
      await saveShared("work", updated)
    } catch (error) {
      console.error(error)
    }
  }

  async function saveWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingWork || !editingWork.title.trim()) return
    const item = editingWork
    setWork((current) => {
      const exists = current.some((row) => row.id === item.id)
      return exists
        ? current.map((row) => (row.id === item.id ? item : row))
        : [...current, item]
    })
    setEditingWork(null)
    try {
      await saveShared("work", item)
    } catch (error) {
      console.error(error)
    }
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingCustomer || !editingCustomer.name.trim()) return
    const item = editingCustomer
    setCustomers((current) => {
      const exists = current.some((row) => row.id === item.id)
      return exists
        ? current.map((row) => (row.id === item.id ? item : row))
        : [...current, item]
    })
    setEditingCustomer(null)
    try {
      await saveShared("customer", item)
    } catch (error) {
      console.error(error)
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingProduct || !editingProduct.name.trim()) return
    const item = editingProduct
    setProducts((current) => {
      const exists = current.some((row) => row.id === item.id)
      return exists
        ? current.map((row) => (row.id === item.id ? item : row))
        : [...current, item]
    })
    setEditingProduct(null)
    try {
      await saveShared("product", item)
    } catch (error) {
      console.error(error)
    }
  }

  function blankWork(status: Status = "todo"): WorkItem {
    return {
      id: nextId(work, "W"),
      title: "",
      status,
      workType: "その他",
      assignee: "あかね",
      priority: "中",
      originType: "Outbound",
      channel: "Email",
      productIds: [],
    }
  }

  function blankCustomer(): Customer {
    return {
      id: nextId(customers, "C"),
      name: "",
      country: "",
      category: "",
      contact: "",
      email: "",
      note: "",
      prices: [],
    }
  }

  function blankProduct(): Product {
    return {
      id: nextId(products, "M"),
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

  function addPrice() {
    if (!editingCustomer) return
    setEditingCustomer({
      ...editingCustomer,
      prices: [
        ...(editingCustomer.prices || []),
        {
          id: uid(),
          productId: products[0]?.id || "",
          price: "",
          currency: "JPY",
          unit: "kg",
          locked: true,
        },
      ],
    })
  }

  function updatePrice(id: string, patch: Partial<CustomerPrice>) {
    if (!editingCustomer) return
    setEditingCustomer({
      ...editingCustomer,
      prices: (editingCustomer.prices || []).map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    })
  }

  function addDoc() {
    if (!editingProduct) return
    setEditingProduct({
      ...editingProduct,
      docs: [...(editingProduct.docs || []), { id: uid(), title: "", url: "" }],
    })
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginBusy(true)
    setLoginError("")
    try {
      const response = await fetch("/api/workboard/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setLoginError(data.error || "ログインできませんでした。")
        return
      }
      const session = await fetch("/api/workboard/auth/session", { cache: "no-store" })
      const sessionData = await session.json()
      if (!sessionData.authenticated) {
        setLoginError("このアカウントはWORKBOARDの利用許可がありません。")
        return
      }
      setAuth({
        loading: false,
        configured: true,
        authenticated: true,
        user: sessionData.user,
      })
      setLoginPassword("")
    } finally {
      setLoginBusy(false)
    }
  }

  async function logout() {
    await fetch("/api/workboard/auth/logout", { method: "POST" })
    setAuth({ loading: false, configured: true, authenticated: false })
  }

  if (auth.loading) {
    return (
      <main className="fixed inset-0 z-[200] grid place-items-center bg-[#090a09] text-[#f4f5f2]">
        <div className="text-sm text-white/45">WORKBOARDを確認中...</div>
      </main>
    )
  }

  if (auth.configured && !auth.authenticated) {
    return (
      <main className="fixed inset-0 z-[200] grid place-items-center bg-[#090a09] px-5 text-[#f4f5f2]">
        <form onSubmit={login} className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#111311] p-6 shadow-2xl">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">SHOJUEN WORKBOARD</div>
          <h1 className="text-2xl font-semibold">社内ログイン</h1>
          <p className="mt-2 text-sm leading-6 text-white/45">許可されたメンバーだけが業務・取引先・価格情報を閲覧できます。</p>
          <div className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={inputClass}
              placeholder="メールアドレス"
            />
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className={inputClass}
              placeholder="パスワード"
            />
          </div>
          {loginError && <p className="mt-3 text-xs leading-5 text-red-300">{loginError}</p>}
          <button
            type="submit"
            disabled={loginBusy}
            className="mt-5 w-full rounded-xl bg-[#eef3ea] px-4 py-3 text-sm font-semibold text-[#11150f] disabled:opacity-50"
          >
            {loginBusy ? "確認中..." : "ログイン"}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 z-[200] overflow-hidden bg-[#090a09] text-[#f4f5f2]">
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 bg-[#090a09]/95 px-5 py-4 backdrop-blur md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <span className="inline-block size-2 rounded-full bg-[#66845c]" />
                SHOJUEN WORKBOARD
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                {tab === "work" ? "業務管理" : tab === "customers" ? "取引先マスタ" : tab === "products" ? "商品マスタ" : "AI取込候補"}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {tab === "work" &&
                  "営業・仕入・物流・証明書・HPなど、全社の仕事を状態で見える化。"}
                {tab === "customers" &&
                  "取引先情報と確定済み取引条件を管理。AIはここにない価格を推測しない。"}
                {tab === "products" &&
                  "商品ID・特徴・原価・卸価格・証明書を一元管理。"}
                {tab === "ai" &&
                  "ChatGPT・Claudeの会話から抽出した候補を確認し、正式データにする前に承認・却下。"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {auth.configured && auth.authenticated && (
                <button onClick={logout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/55 hover:bg-white/10">
                  ログアウト
                </button>
              )}
            {tab !== "ai" && (
              <button
                onClick={() => {
                  if (tab === "work") setEditingWork(blankWork())
                  if (tab === "customers") setEditingCustomer(blankCustomer())
                  if (tab === "products") setEditingProduct(blankProduct())
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-medium text-[#11150f] transition hover:bg-white"
              >
                <Plus className="size-4" />
                {tab === "work" ? "業務を追加" : tab === "customers" ? "取引先を追加" : "商品を追加"}
              </button>
            )}
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1">
            <TabButton active={tab === "work"} onClick={() => setTab("work")} icon={<BarChart3 className="size-4" />} label="業務管理" />
            <TabButton active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="size-4" />} label="取引先マスタ" />
            <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="size-4" />} label="商品マスタ" />
            <TabButton active={tab === "ai"} onClick={() => setTab("ai")} icon={<Bot className="size-4" />} label={`AI取込候補${pendingAiCount ? ` (${pendingAiCount})` : ""}`} />
          </nav>

          {tab === "work" && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="進行中" value={activeCount} />
                <Kpi label="待ち" value={waitingCount} />
                <Kpi label="要判断" value={decisionCount} />
                <Kpi label="期限あり" value={dueCount} />
              </div>
              <div className="mt-4">
                <SearchBox value={workQuery} onChange={setWorkQuery} placeholder="件名・取引先・担当・媒体・商品IDで検索..." />
              </div>
            </>
          )}
          {tab === "customers" && (
            <div className="mt-4">
              <SearchBox value={customerQuery} onChange={setCustomerQuery} placeholder="取引先ID・会社名・国・メールで検索..." />
            </div>
          )}
          {tab === "products" && (
            <div className="mt-4">
              <SearchBox value={productQuery} onChange={setProductQuery} placeholder="商品ID・商品名・生産者・産地で検索..." />
            </div>
          )}
        </header>

        {tab === "work" && (
          <section className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
            <div className="flex h-full min-w-max gap-3">
              {STATUSES.map((status) => {
                const items = filteredWork.filter((item) => item.status === status.id)
                return (
                  <section
                    key={status.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggingId) moveWork(draggingId, status.id)
                      setDraggingId(null)
                    }}
                    className="flex h-full w-[310px] flex-col rounded-[20px] border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusDot(status.id)}`} />
                        <h2 className="text-sm font-semibold">{status.label}</h2>
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">{items.length}</span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                      {items.map((item) => {
                        const customer = customers.find((c) => c.id === item.customerId)
                        return (
                          <article
                            key={item.id}
                            draggable
                            onDragStart={() => setDraggingId(item.id)}
                            onDragEnd={() => setDraggingId(null)}
                            onClick={() => setEditingWork(item)}
                            className="cursor-grab rounded-2xl border border-white/10 bg-[#111311] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-semibold leading-5">{item.title}</h3>
                                {customer && (
                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-white/45">
                                    <Building2 className="size-3" />
                                    <span className="truncate">{customer.name}</span>
                                  </div>
                                )}
                              </div>
                              <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${priorityClass(item.priority)}`}>
                                {item.priority || "中"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.workType && <Tag>{item.workType}</Tag>}
                              {item.originType && <Tag>{item.originType}</Tag>}
                              {item.channel && <Tag>{item.channel}</Tag>}
                              {(item.productIds || []).map((id) => <Tag key={id}>{id}</Tag>)}
                            </div>

                            {item.nextAction && (
                              <div className="mt-3 rounded-xl bg-white/[0.045] p-2.5">
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/35">
                                  <CalendarClock className="size-3" /> 次のアクション
                                </div>
                                <p className="text-xs leading-5 text-white/65">{item.nextAction}</p>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                              <span>{item.assignee || "未担当"}</span>
                              <span>{item.dueDate || "期限なし"}</span>
                            </div>
                          </article>
                        )
                      })}

                      <button
                        onClick={() => setEditingWork(blankWork(status.id))}
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 py-3 text-xs font-medium text-white/35 transition hover:border-white/25 hover:bg-white/5 hover:text-white/70"
                      >
                        <Plus className="size-3.5" /> 追加
                      </button>
                    </div>
                  </section>
                )
              })}
            </div>
          </section>
        )}

        {tab === "customers" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100/80">
              <div className="flex items-center gap-2 font-semibold text-amber-100">
                <ShieldCheck className="size-4" /> AI価格ルール
              </div>
              <p className="mt-1 text-xs leading-5 text-amber-100/60">
                価格・数量・送料・支払条件はこのマスタの確定値だけを使用。未登録値の推測・改変は禁止。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <article
                  key={customer.id}
                  onClick={() => setEditingCustomer(customer)}
                  className="cursor-pointer rounded-[20px] border border-white/10 bg-[#111311] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-white/8 px-2 py-1 text-xs font-bold tracking-[0.08em] text-white/60">{customer.id}</span>
                      <h2 className="mt-3 text-lg font-semibold">{customer.name}</h2>
                      <p className="mt-1 text-xs text-white/45">
                        {[customer.category, customer.country].filter(Boolean).join(" · ") || "詳細未設定"}
                      </p>
                    </div>
                    <Users className="size-5 text-white/25" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <MiniStat label="価格条件" value={(customer.prices || []).length} />
                    <MiniStat label="関連業務" value={work.filter((item) => item.customerId === customer.id).length} />
                  </div>
                  {customer.email && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
                      <Mail className="size-3.5" /> {customer.email}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "products" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  onClick={() => setEditingProduct(product)}
                  className="cursor-pointer rounded-[20px] border border-white/10 bg-[#111311] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-[#66845c]/15 px-2 py-1 text-xs font-bold tracking-[0.08em] text-[#bed2b7]">{product.id}</span>
                      <h2 className="mt-3 text-lg font-semibold">{product.name}</h2>
                      <p className="mt-1 text-xs text-white/45">
                        {[product.producer, product.origin, product.use].filter(Boolean).join(" · ") || "詳細未設定"}
                      </p>
                    </div>
                    <Package className="size-5 text-white/25" />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <MiniStat label="業務" value={work.filter((item) => (item.productIds || []).includes(product.id)).length} />
                    <MiniStat label="取引先価格" value={customers.reduce((sum, customer) => sum + (customer.prices || []).filter((row) => row.productId === product.id).length, 0)} />
                    <MiniStat label="資料" value={(product.docs || []).length} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

        {tab === "ai" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="未確認" value={pendingAiCount} />
                <Kpi label="承認" value={aiCandidates.filter((item) => item.status === "approved").length} />
                <Kpi label="要修正" value={aiCandidates.filter((item) => item.status === "needs_edit").length} />
                <Kpi label="取込バッチ" value={aiBatches.length} />
              </div>

              {aiLoading ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-white/45">
                  AI取込候補を読み込み中...
                </div>
              ) : aiCandidates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
                  <Bot className="mx-auto size-7 text-white/30" />
                  <h2 className="mt-3 text-base font-semibold">まだAI取込候補はありません</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    次にClaudeの過去会話を棚卸しして、この受け皿へ入れます。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiCandidates.map((candidate) => {
                    const batch = aiBatches.find((item) => item.id === candidate.batch_id)
                    return (
                      <article key={candidate.id} className="rounded-2xl border border-white/10 bg-[#111311] p-4 md:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.1em] text-white/35">
                              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                                {aiCandidateLabel(candidate.candidate_type)}
                              </span>
                              <span>{(batch?.source || "AI").toUpperCase()}</span>
                              {candidate.confidence != null && (
                                <span>信頼度 {Math.round(candidate.confidence * 100)}%</span>
                              )}
                            </div>
                            <h2 className="mt-3 text-lg font-semibold">
                              {candidate.title || batch?.session_title || "名称未設定"}
                            </h2>
                            {batch?.summary && (
                              <p className="mt-2 text-sm leading-6 text-white/50">{batch.summary}</p>
                            )}
                            {candidate.target_id && (
                              <p className="mt-2 text-xs text-white/35">対象ID: {candidate.target_id}</p>
                            )}
                            {candidate.payload && Object.keys(candidate.payload).length > 0 && (
                              <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/55">
                                {JSON.stringify(candidate.payload, null, 2)}
                              </pre>
                            )}
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button
                              onClick={() => updateAiCandidate(candidate.id, "approved").catch(console.error)}
                              className="rounded-full bg-[#eef3ea] px-4 py-2 text-xs font-semibold text-[#11150f]"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => updateAiCandidate(candidate.id, "needs_edit").catch(console.error)}
                              className="rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs text-amber-100"
                            >
                              要修正
                            </button>
                            <button
                              onClick={() => updateAiCandidate(candidate.id, "rejected").catch(console.error)}
                              className="rounded-full border border-red-300/15 px-4 py-2 text-xs text-red-300"
                            >
                              却下
                            </button>
                          </div>
                        </div>

                        {candidate.status !== "pending" && (
                          <div className="mt-4 text-xs text-white/35">
                            現在の判定: {candidate.status === "approved" ? "承認" : candidate.status === "rejected" ? "却下" : "要修正"}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        )}

      {editingWork && (
        <Modal onClose={() => setEditingWork(null)} wide>
          <form onSubmit={saveWork}>
            <ModalTitle eyebrow="業務詳細" title={editingWork.title || "新しい業務"} onClose={() => setEditingWork(null)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="件名"><input autoFocus className={inputClass} value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} /></Field>
              <Field label="状態"><select className={inputClass} value={editingWork.status} onChange={(e) => setEditingWork({ ...editingWork, status: e.target.value as Status })}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
              <Field label="取引先"><select className={inputClass} value={editingWork.customerId || ""} onChange={(e) => setEditingWork({ ...editingWork, customerId: e.target.value || undefined })}><option value="">なし</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.id} {c.name}</option>)}</select></Field>
              <Field label="業務種別"><select className={inputClass} value={editingWork.workType || ""} onChange={(e) => setEditingWork({ ...editingWork, workType: e.target.value })}>{WORK_TYPES.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="担当"><input className={inputClass} value={editingWork.assignee || ""} onChange={(e) => setEditingWork({ ...editingWork, assignee: e.target.value })} /></Field>
              <Field label="優先度"><select className={inputClass} value={editingWork.priority || "中"} onChange={(e) => setEditingWork({ ...editingWork, priority: e.target.value as WorkItem["priority"] })}>{["低","中","高","緊急"].map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="期限"><input type="date" className={inputClass} value={editingWork.dueDate || ""} onChange={(e) => setEditingWork({ ...editingWork, dueDate: e.target.value })} /></Field>
              <Field label="国"><input className={inputClass} value={editingWork.country || ""} onChange={(e) => setEditingWork({ ...editingWork, country: e.target.value })} /></Field>
              <Field label="接点区分"><select className={inputClass} value={editingWork.originType || "Outbound"} onChange={(e) => setEditingWork({ ...editingWork, originType: e.target.value as WorkItem["originType"] })}>{ORIGINS.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="媒体"><select className={inputClass} value={editingWork.channel || "Email"} onChange={(e) => setEditingWork({ ...editingWork, channel: e.target.value })}>{CHANNELS.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <div className="md:col-span-2"><Field label="次のアクション"><input className={inputClass} value={editingWork.nextAction || ""} onChange={(e) => setEditingWork({ ...editingWork, nextAction: e.target.value })} /></Field></div>
            </div>

            <ProductPicker products={products} selected={editingWork.productIds || []} onToggle={(id) => setEditingWork({ ...editingWork, productIds: (editingWork.productIds || []).includes(id) ? (editingWork.productIds || []).filter((v) => v !== id) : [...(editingWork.productIds || []), id] })} />

            <div className="mt-4"><Field label="メモ"><textarea rows={4} className={`${inputClass} min-h-28 resize-y py-3`} value={editingWork.memo || ""} onChange={(e) => setEditingWork({ ...editingWork, memo: e.target.value })} /></Field></div>

            <ModalActions existing={work.some((item) => item.id === editingWork.id)} onDelete={async () => { const id = editingWork.id; setWork((current) => current.filter((item) => item.id !== id)); setEditingWork(null); try { await deleteShared("work", id) } catch (error) { console.error(error) } }} onCancel={() => setEditingWork(null)} />
          </form>
        </Modal>
      )}

      {editingCustomer && (
        <Modal onClose={() => setEditingCustomer(null)} wide>
          <form onSubmit={saveCustomer}>
            <ModalTitle eyebrow="取引先マスタ" title={editingCustomer.name || "新しい取引先"} onClose={() => setEditingCustomer(null)} />
            <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <div className="text-[10px] font-semibold tracking-[0.14em] text-white/35">取引先ID</div>
              <div className="mt-1 text-2xl font-bold tracking-[0.08em]">{editingCustomer.id}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="会社・店舗名"><input autoFocus className={inputClass} value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} /></Field>
              <Field label="国"><input className={inputClass} value={editingCustomer.country || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, country: e.target.value })} /></Field>
              <Field label="業態"><input className={inputClass} value={editingCustomer.category || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, category: e.target.value })} /></Field>
              <Field label="担当者名"><input className={inputClass} value={editingCustomer.contact || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, contact: e.target.value })} /></Field>
              <Field label="メール"><input className={inputClass} value={editingCustomer.email || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} /></Field>
              <Field label="電話"><input className={inputClass} value={editingCustomer.phone || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} /></Field>
              <Field label="Instagram"><input className={inputClass} value={editingCustomer.instagram || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, instagram: e.target.value })} /></Field>
              <Field label="LinkedIn"><input className={inputClass} value={editingCustomer.linkedin || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, linkedin: e.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="備考"><textarea rows={3} className={`${inputClass} min-h-24 resize-y py-3`} value={editingCustomer.note || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, note: e.target.value })} /></Field></div>
            </div>

            <section className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100"><ShieldCheck className="size-4" /> 確定取引条件</h3>
                  <p className="mt-1 text-xs text-amber-100/60">AIはここに登録された値だけをメールに使用。未登録値は「要確認」。</p>
                </div>
                <button type="button" onClick={addPrice} className="rounded-full border border-amber-300/20 px-3 py-2 text-xs text-amber-100">条件追加</button>
              </div>
              <div className="mt-4 space-y-3">
                {(editingCustomer.prices || []).map((row) => (
                  <div key={row.id} className="rounded-xl border border-white/10 bg-[#0d0f0d] p-3">
                    <div className="grid gap-2 md:grid-cols-4">
                      <select className={inputClass} value={row.productId} onChange={(e) => updatePrice(row.id, { productId: e.target.value })}>{products.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name}</option>)}</select>
                      <input className={inputClass} placeholder="価格" value={row.price} onChange={(e) => updatePrice(row.id, { price: e.target.value })} />
                      <input className={inputClass} placeholder="通貨" value={row.currency} onChange={(e) => updatePrice(row.id, { currency: e.target.value })} />
                      <input className={inputClass} placeholder="単位" value={row.unit} onChange={(e) => updatePrice(row.id, { unit: e.target.value })} />
                      <input className={inputClass} placeholder="MOQ" value={row.moq || ""} onChange={(e) => updatePrice(row.id, { moq: e.target.value })} />
                      <input className={inputClass} placeholder="送料条件" value={row.shipping || ""} onChange={(e) => updatePrice(row.id, { shipping: e.target.value })} />
                      <input className={inputClass} placeholder="支払条件" value={row.payment || ""} onChange={(e) => updatePrice(row.id, { payment: e.target.value })} />
                      <input type="date" className={inputClass} value={row.effectiveFrom || ""} onChange={(e) => updatePrice(row.id, { effectiveFrom: e.target.value })} />
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={row.locked} onChange={(e) => updatePrice(row.id, { locked: e.target.checked })} /> AI変更禁止ロック</label>
                  </div>
                ))}
              </div>
            </section>

            <ModalActions existing={customers.some((item) => item.id === editingCustomer.id)} onDelete={async () => { const id = editingCustomer.id; setCustomers((current) => current.filter((item) => item.id !== id)); setEditingCustomer(null); try { await deleteShared("customer", id) } catch (error) { console.error(error) } }} onCancel={() => setEditingCustomer(null)} />
          </form>
        </Modal>
      )}

      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)} wide>
          <form onSubmit={saveProduct}>
            <ModalTitle eyebrow="商品マスタ" title={editingProduct.name || "新しい商品"} onClose={() => setEditingProduct(null)} />
            <div className="mb-5 rounded-xl border border-[#66845c]/30 bg-[#66845c]/10 p-4">
              <div className="text-[10px] font-semibold tracking-[0.14em] text-[#a9c19f]">商品ID</div>
              <div className="mt-1 text-2xl font-bold tracking-[0.08em] text-[#d7e5d2]">{editingProduct.id}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["商品名","name"],["生産者 / 仕入先","producer"],["産地","origin"],["用途","use"],["色","color"],["旨味","umami"],["苦味","bitterness"],["香り","aroma"],["原価","cost"],["標準卸価格","price"],["最低ロット","moq"],["供給状況","supply"]
              ].map(([label,key]) => (
                <Field key={key} label={label}><input className={inputClass} value={(editingProduct as any)[key] || ""} onChange={(e) => setEditingProduct({ ...editingProduct, [key]: e.target.value })} /></Field>
              ))}
              <div className="md:col-span-2"><Field label="備考"><textarea rows={3} className={`${inputClass} min-h-24 resize-y py-3`} value={editingProduct.memo || ""} onChange={(e) => setEditingProduct({ ...editingProduct, memo: e.target.value })} /></Field></div>
            </div>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold">証明書・資料</h3><p className="mt-1 text-xs text-white/40">現段階はURL登録。公開GitHubにファイル本体は置きません。</p></div>
                <button type="button" onClick={addDoc} className="rounded-full border border-white/10 px-3 py-2 text-xs">資料追加</button>
              </div>
              <div className="mt-4 space-y-2">
                {(editingProduct.docs || []).map((doc) => (
                  <div key={doc.id} className="grid gap-2 md:grid-cols-[1fr_1.5fr_auto]">
                    <input className={inputClass} placeholder="資料名" value={doc.title} onChange={(e) => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).map((d) => d.id === doc.id ? { ...d, title: e.target.value } : d) })} />
                    <input className={inputClass} placeholder="URL" value={doc.url} onChange={(e) => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).map((d) => d.id === doc.id ? { ...d, url: e.target.value } : d) })} />
                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).filter((d) => d.id !== doc.id) })} className="rounded-xl px-3 text-red-400"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
            </section>

            <ModalActions existing={products.some((item) => item.id === editingProduct.id)} onDelete={async () => { const id = editingProduct.id; setProducts((current) => current.filter((item) => item.id !== id)); setEditingProduct(null); try { await deleteShared("product", id) } catch (error) { console.error(error) } }} onCancel={() => setEditingProduct(null)} />
          </form>
        </Modal>
      )}

      <div className="pointer-events-none absolute bottom-3 right-4 hidden items-center gap-2 rounded-full border border-white/10 bg-[#111311]/90 px-3 py-1.5 text-[10px] text-white/40 backdrop-blur md:flex">
        <FileText className="size-3" />
        {auth.configured && auth.authenticated ? "共有DB接続中" : "DB未接続の試作モード"}
      </div>
    </main>
  )
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0d0f0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/25 focus:ring-2 focus:ring-white/5"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-white/55">{label}</span>{children}</label>
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search className="size-4 text-white/35" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25" /></label>
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-white text-[#11150f]" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>{icon}{label}</button>
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"><div className="text-[10px] font-semibold tracking-[0.14em] text-white/35">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-white/[0.045] p-2.5 text-center"><div className="text-lg font-semibold">{value}</div><div className="text-[10px] text-white/35">{label}</div></div>
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-[10px] text-white/55">{children}</span>
}

function ProductPicker({ products, selected, onToggle }: { products: Product[]; selected: string[]; onToggle: (id: string) => void }) {
  return <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><h3 className="text-sm font-semibold">関連商品</h3><div className="mt-3 flex flex-wrap gap-2">{products.map((product) => { const active = selected.includes(product.id); return <button key={product.id} type="button" onClick={() => onToggle(product.id)} className={`rounded-xl border px-3 py-2 text-left text-xs transition ${active ? "border-[#66845c] bg-[#66845c]/20 text-[#d6e5d1]" : "border-white/10 bg-white/[0.025] text-white/50"}`}><b>{product.id}</b><span className="ml-2">{product.name}</span></button> })}</div></section>
}

function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose() }}><div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] border border-white/10 bg-[#111311] p-5 shadow-2xl md:rounded-[26px] md:p-6 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>{children}</div></div>
}

function ModalTitle({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return <div className="mb-5 flex items-center justify-between gap-4"><div><div className="text-xs font-semibold tracking-[0.16em] text-white/35">{eyebrow}</div><h2 className="mt-1 text-xl font-semibold">{title}</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/10"><X className="size-5" /></button></div>
}

function ModalActions({ existing, onDelete, onCancel }: { existing: boolean; onDelete: () => void; onCancel: () => void }) {
  return <div className="mt-6 flex items-center justify-between gap-3">{existing ? <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10"><Trash2 className="size-4" />削除</button> : <span />}<div className="flex gap-2"><button type="button" onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm">キャンセル</button><button type="submit" className="rounded-full bg-[#eef3ea] px-5 py-2.5 text-sm font-medium text-[#11150f]">保存</button></div></div>
}

function priorityClass(priority?: WorkItem["priority"]) {
  if (priority === "緊急") return "bg-red-400/15 text-red-300"
  if (priority === "高") return "bg-orange-400/15 text-orange-300"
  if (priority === "低") return "bg-white/5 text-white/40"
  return "bg-blue-400/10 text-blue-300"
}

function statusDot(status: Status) {
  switch (status) {
    case "todo": return "bg-slate-400"
    case "prep": return "bg-blue-400"
    case "doing": return "bg-cyan-400"
    case "external_wait": return "bg-violet-400"
    case "internal_wait": return "bg-amber-400"
    case "decision": return "bg-orange-400"
    case "hold": return "bg-stone-400"
    case "done": return "bg-emerald-500"
  }
}
