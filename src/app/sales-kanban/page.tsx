"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useOperationSounds } from "./operation-sounds"
import { useWorkDrag } from "./work-drag"
import { workboardFetch } from "./workboard-request"
import { AnalysisOverview, ComparisonChart, monthlyOrderRows, StageTimeAnalysis, MonthlySalesChart } from "./management-analysis"
import { OperationSoundDiagnostics } from "./sound-diagnostics"
import { SALES_CASE_UPDATE_FIELDS, buildSalesCaseUpdatePatch, salesCaseUpdateValue } from "../../lib/sales-case-update"
import { displayActivityNote, stageDurations } from "../../lib/workboard-time-analysis"
import { WORK_UPDATE_FIELDS, buildWorkUpdatePatch, workUpdateValue } from "./work-update"
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  CalendarClock,
  ChevronDown,
  FileText,
  Mail,
  Package,
  Plus,
  Truck,
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

type Tab = "analysis" | "sales" | "orders" | "work" | "activity" | "customers" | "products" | "shipping" | "ai" | "trash"
type TrashItem = { type: "work" | "customer" | "product" | "sales_case" | "order"; id: string; title: string; deletedAt: string }
const TRASH_LABELS = { work: "業務", customer: "取引先", product: "商品", sales_case: "案件", order: "受注" }
// Orders are kept as confirmed business history, separate from sales opportunities.

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

type WorkEvent = {
  id: string
  workItemId?: string
  salesCaseId?: string
  eventType: string
  eventDate: string
  channel?: string
  note?: string
  counterpartyName?: string
  counterpartyEmail?: string
  direction?: string
  source?: string
  sourceCandidateId?: string
}

type SalesCase = {
  id: string
  customerId: string
  title: string
  theme: string
  caseType: "new_business" | "existing_followup"
  originType?: "Outbound" | "Inbound" | "Referral" | "Existing" | ""
  channel?: string
  stage: "uncontacted" | "initial_sent" | "replied" | "qualifying" | "quoted" | "sample_requested" | "sample_sent" | "considering" | "won" | "lost" | "hold"
  heat: "A" | "B" | "C"
  nextFollowUpDate?: string
  nextAction?: string
  assignee: string
  lastContactAt?: string
  closeReason?: string
  closeNote?: string
  wonAt?: string
  closedAt?: string
  productIds?: string[]
  createdAt?: string
  updatedAt?: string
}

type OrderItem = {
  id: string
  productId: string
  quantity: string
  unit: string
  unitPrice: string
  lineAmount: string
}

type Order = {
  id: string
  customerId: string
  salesCaseId?: string
  orderType: "first" | "repeat"
  orderStatus: "confirmed" | "shipped" | "completed" | "cancelled"
  orderDate: string
  currency: string
  shippingAmount?: string
  totalAmount?: string
  externalOrderRef?: string
  note?: string
  createdAt?: string
  updatedAt?: string
  items: OrderItem[]
}

type ShippingRate = {
  id: string
  rateStage?: "estimate" | "quoted" | "actual" | ""
  origin?: string
  destination: string
  carrier?: string
  service?: string
  weightFromKg?: string
  weightToKg?: string
  actualWeightKg?: string
  sizeClass?: string
  price: string
  currency: string
  transitTime?: string
  terms?: string
  source?: string
  verifiedAt?: string
  shipmentDate?: string
  customerId?: string
  note?: string
  createdAt?: string
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
  salesCaseId?: string
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
  priceHistory?: { id: string; productId: string; price: string; currency: string; unit: string; effectiveFrom: string; createdAt: string; current: boolean; note: string }[]
}

type ProductDoc = {
  id: string
  title: string
  url: string
  mimeType?: string
  isPrivate?: boolean
}

type ProductCost = {
  id: string
  productId: string
  costType: "base_purchase" | "processing" | "packaging" | "labeling" | "inspection" | "domestic_freight" | "other"
  label: string
  amount: string
  currency: string
  unit: string
  quantityBasis?: string
  effectiveFrom?: string
  effectiveTo?: string
  supplierOrVendor?: string
  note?: string
  createdAt?: string
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

const SALES_STAGE_LABELS: Record<SalesCase["stage"], string> = {
  uncontacted: "未接触",
  initial_sent: "初回送信",
  replied: "返信あり",
  qualifying: "条件確認中",
  quoted: "見積提示",
  sample_requested: "サンプル要求あり",
  sample_sent: "サンプル送付",
  considering: "検討中",
  won: "成約",
  lost: "失注",
  hold: "保留",
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
  const { playOperationSound, readSoundDiagnostics } = useOperationSounds()
  const suppressClickSoundUntil = useRef(0)
  const [tab, setTab] = useState<Tab>("sales")
  const [work, setWork] = useState<WorkItem[]>(starterWork)
  const [salesCases, setSalesCases] = useState<SalesCase[]>([])
  const [salesAttributionConfigured, setSalesAttributionConfigured] = useState(false)
  const [salesFilter, setSalesFilter] = useState<"all" | "overdue" | "a_rank">("all")
  const [salesKpiGroupBy, setSalesKpiGroupBy] = useState<"channel" | "originType">("channel")
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<WorkEvent[]>([])
  const [customers, setCustomers] = useState<Customer[]>(starterCustomers)
  const [products, setProducts] = useState<Product[]>(starterProducts)
  const [productCosts, setProductCosts] = useState<ProductCost[]>([])
  const [newProductCost, setNewProductCost] = useState<Partial<ProductCost>>({})
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [aiBatches, setAiBatches] = useState<AiImportBatch[]>([])
  const [aiCandidates, setAiCandidates] = useState<AiImportCandidate[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoadError, setAiLoadError] = useState("")
  const [aiLoadAttempt, setAiLoadAttempt] = useState(0)
  const aiImportLock = useRef(false)
  const aiReviewLock = useRef(false)
  const [aiReviewBusy, setAiReviewBusy] = useState(false)
  const [aiReviewError, setAiReviewError] = useState("")
  const [aiEdit, setAiEdit] = useState<{ id: string; title: string; candidateType: string; payloadJson: string } | null>(null)
  const [aiEditError, setAiEditError] = useState("")
  const [aiEditMessage, setAiEditMessage] = useState("")
  const [aiCreatedBoxId, setAiCreatedBoxId] = useState("")
  const [aiImportJson, setAiImportJson] = useState("")
  const [aiImportMessage, setAiImportMessage] = useState("")
  const [aiImportBusy, setAiImportBusy] = useState(false)
  const [aiTypeFilter, setAiTypeFilter] = useState("all")
  const [aiStatusFilter, setAiStatusFilter] = useState("pending")
  const [aiMatchCustomer, setAiMatchCustomer] = useState<Record<string, string>>({})
  const [aiMatchCase, setAiMatchCase] = useState<Record<string, string>>({})
  const [aiMatchWork, setAiMatchWork] = useState<Record<string, string>>({})
  const [aiEventTarget, setAiEventTarget] = useState<Record<string, string>>({})
  const [aiNewWorkStatus, setAiNewWorkStatus] = useState<Record<string, Status>>({})
  const [aiMatchProducts, setAiMatchProducts] = useState<Record<string, string[]>>({})
  const [aiPriceClass, setAiPriceClass] = useState<Record<string, string>>({})
  const [aiShippingStage, setAiShippingStage] = useState<Record<string, string>>({})
  const [aiShippingDraft, setAiShippingDraft] = useState<Record<string, Record<string, string>>>({})
  const [aiPriceDraft, setAiPriceDraft] = useState<Record<string, Record<string, string>>>({})
  const [aiCostGroupProduct, setAiCostGroupProduct] = useState<Record<string, string>>({})
  const [aiCostGroupVendor, setAiCostGroupVendor] = useState<Record<string, string>>({})
  const [aiBulkCostBusy, setAiBulkCostBusy] = useState<Record<string, boolean>>({})
  const [aiCostRows, setAiCostRows] = useState<Record<string, Array<Record<string, string>>>>({})
  const [workQuery, setWorkQuery] = useState("")
  const [customerQuery, setCustomerQuery] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [activityFilter, setActivityFilter] = useState<"sales" | "system" | "all">("sales")
  const [eventSalesLinksConfigured, setEventSalesLinksConfigured] = useState(false)
  const [trash, setTrash] = useState<TrashItem[]>([])
  const [trashConfigured, setTrashConfigured] = useState(false)
  const [editingEventLink, setEditingEventLink] = useState<WorkEvent | null>(null)
  const [eventLinkCaseId, setEventLinkCaseId] = useState("")
  const [eventLinkBusy, setEventLinkBusy] = useState(false)
  const [eventLinkError, setEventLinkError] = useState("")
  const [salesEventNote, setSalesEventNote] = useState("")
  const [salesEventChannel, setSalesEventChannel] = useState("")
  const [salesEventBusy, setSalesEventBusy] = useState(false)
  const [editingSalesCase, setEditingSalesCase] = useState<SalesCase | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [wonFollowupSource, setWonFollowupSource] = useState<SalesCase | null>(null)
  const [wonCreateOrder, setWonCreateOrder] = useState(true)
  const [wonCreateFollowup, setWonCreateFollowup] = useState(true)
  const [postOrderFollowupSource, setPostOrderFollowupSource] = useState<SalesCase | null>(null)
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [docUploadBusy, setDocUploadBusy] = useState(false)
  const [docUploadMessage, setDocUploadMessage] = useState("")
  const [productSaveBusy, setProductSaveBusy] = useState(false)
  const mutationLock = useRef(false)
  const [mutationBusy, setMutationBusy] = useState(false)
  const workDrag = useWorkDrag({
    onLift: (eventTime) => {
      suppressClickSoundUntil.current = Infinity
      playOperationSound("drag", eventTime)
    },
    onDrop: (id, statusId, eventTime) => {
      const status = STATUSES.find((row) => row.id === statusId)
      if (!status || mutationLock.current) return
      playOperationSound("drop", eventTime)
      void moveWork(id, status.id)
    },
    onFinish: (lifted) => {
      if (lifted) suppressClickSoundUntil.current = performance.now() + 200
    },
  })
  const [hydrated, setHydrated] = useState(false)
  const [sharedDataError, setSharedDataError] = useState("")
  const [sharedDataAttempt, setSharedDataAttempt] = useState(0)
  const [auth, setAuth] = useState<AuthState>({ loading: true, configured: false, authenticated: false })
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginBusy, setLoginBusy] = useState(false)
  const [authError, setAuthError] = useState("")
  const [authAttempt, setAuthAttempt] = useState(0)
  const sessionLock = useRef(false)
  const [logoutBusy, setLogoutBusy] = useState(false)

  useEffect(() => {
    setSalesEventChannel(CHANNELS.includes(editingSalesCase?.channel || "") ? editingSalesCase?.channel || "" : "")
  }, [editingSalesCase?.id, editingSalesCase?.channel])

  useEffect(() => {
    const expired = () => {
      setAuth({ loading: false, configured: true, authenticated: false })
      setLoginError("ログインの有効期限が切れました。もう一度ログインしてください。")
      setHydrated(false)
    }
    window.addEventListener("workboard-session-expired", expired)
    return () => window.removeEventListener("workboard-session-expired", expired)
  }, [])

  useEffect(() => {
    let cancelled = false
    setAuthError("")
    setAuth((current) => ({ ...current, loading: true }))
    readWorkboardSession()
      .then((data) => {
        if (cancelled) return
        setAuth({ loading: false, configured: data.configured, authenticated: data.authenticated, user: data.user })
      })
      .catch(() => {
        if (cancelled) return
        setAuthError("ログイン状態を確認できませんでした。通信状態を確認し、再試行してください。")
        setAuth({ loading: false, configured: true, authenticated: false })
      })
    return () => { cancelled = true }
  }, [authAttempt])


  useEffect(() => {
    if (!(auth.configured && auth.authenticated)) return
    let cancelled = false
    const controller = new AbortController()
    setAiLoading(true)
    setAiLoadError("")
    readAiImportData(controller.signal)
      .then((data) => {
        if (cancelled) return
        setAiBatches(data.batches)
        setAiCandidates(data.candidates)
      })
      .catch((error) => {
        if (cancelled) return
        setAiLoadError(error instanceof Error ? error.message : "AI取込候補を読み込めませんでした。")
      })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true; controller.abort() }
  }, [auth.configured, auth.authenticated, aiLoadAttempt])

  useEffect(() => {
    if (auth.loading || authError) return
    if (auth.configured && !auth.authenticated) { setHydrated(false); return }

    if (auth.configured && auth.authenticated) {
      let cancelled = false
      setHydrated(false)
      setSharedDataError("")
      readSharedWorkboardData()
        .then((data) => {
          if (cancelled) return
          applySharedData(data)
          setHydrated(true)
        })
        .catch((error) => {
          if (cancelled) return
          console.error(error)
          setSharedDataError("共有データを読み込めませんでした。通信状態を確認し、もう一度お試しください。")
        })
      return () => { cancelled = true }
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
  }, [auth.loading, auth.configured, auth.authenticated, sharedDataAttempt, authError])

  useEffect(() => {
    if (!hydrated || auth.configured || authError) return
    window.localStorage.setItem(WORK_KEY, JSON.stringify(work))
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers))
    window.localStorage.setItem(PRODUCT_KEY, JSON.stringify(products))
  }, [work, customers, products, hydrated, auth.configured, auth.authenticated, authError])

  function applySharedData(data: Record<string, any>) {
    setWork(Array.isArray(data.work) ? data.work : [])
    setSalesCases(Array.isArray(data.salesCases) ? data.salesCases : [])
    setSalesAttributionConfigured(data.salesAttributionConfigured === true)
    setEventSalesLinksConfigured(data.eventSalesLinksConfigured === true)
    setTrashConfigured(data.trashConfigured === true)
    setTrash(Array.isArray(data.trash) ? data.trash : [])
    setOrders(Array.isArray(data.orders) ? data.orders : [])
    setCustomers(Array.isArray(data.customers) ? data.customers : [])
    setProducts(Array.isArray(data.products) ? data.products : [])
    setProductCosts(Array.isArray(data.productCosts) ? data.productCosts : [])
    setEvents(Array.isArray(data.events) ? data.events : [])
    setShippingRates(Array.isArray(data.shippingRates) ? data.shippingRates : [])
  }

  async function refreshSharedAfterWrite() {
    try {
      const data = await readSharedWorkboardData()
      applySharedData(data)
    } catch {
      setSharedDataError("保存は完了しましたが、共有データを更新できませんでした。再読み込みしてください。同じ操作を繰り返す必要はありません。")
      setHydrated(false)
    }
  }

  async function saveShared(type: "work" | "customer" | "product" | "product_cost" | "work_event" | "sales_case", data: WorkItem | Customer | Product | ProductCost | WorkEvent | SalesCase) {
    if (!(auth.configured && auth.authenticated)) return
    const response = await workboardFetch("/api/workboard/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data: type === "sales_case" ? { ...data, expectedStage: (data as SalesCase).stage } : data }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "共有DBへの保存に失敗しました。")
    if (result.stageEvent) setEvents((current) => [result.stageEvent, ...current.filter((item) => item.id !== result.stageEvent.id)])
    if (result.warning) alert(result.warning)
    return result
  }

  async function saveEventLink() {
    if (!editingEventLink || eventLinkBusy) return
    setEventLinkBusy(true)
    setEventLinkError("")
    try {
      const response = await workboardFetch("/api/workboard/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "work_event_link", data: { id: editingEventLink.id, salesCaseId: eventLinkCaseId || null } }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "紐づけを保存できませんでした。")
      setEvents((current) => current.map((event) => event.id === editingEventLink.id ? { ...event, salesCaseId: result.salesCaseId || undefined } : event))
      setEditingEventLink(null)
    } catch (error) {
      setEventLinkError(error instanceof Error ? error.message : "紐づけを保存できませんでした。")
    } finally {
      setEventLinkBusy(false)
    }
  }

  async function appendWorkEvent(workItemId: string, eventType: string, note: string) {
    const event: WorkEvent = {
      id: uid(),
      workItemId,
      eventType,
      eventDate: new Date().toISOString(),
      note,
      source: "workboard_auto",
    }
    const saved = await saveShared("work_event", event)
    setEvents((current) => [{ ...event, id: saved?.id || event.id }, ...current])
  }

  async function appendSalesCaseEvent(
    salesCaseId: string,
    eventType: string,
    note: string,
    channel?: string
  ) {
    const eventDate = new Date().toISOString()
    const event: WorkEvent = {
      id: uid(),
      salesCaseId,
      eventType,
      eventDate,
      channel,
      direction: ["email_sent", "contact_sent"].includes(eventType) ? "outbound" : ["reply_received", "contact_received"].includes(eventType) ? "inbound" : undefined,
      note: note.trim(),
      source: "manual",
    }
    const saved = await saveShared("work_event", event)
    setEvents((current) => [{ ...event, id: saved?.id || event.id }, ...current])

    if (["email_sent", "contact_sent", "reply_received", "contact_received", "quote_sent", "sample_sent"].includes(eventType)) {
      const currentCase = salesCases.find((item) => item.id === salesCaseId)
      if (currentCase) {
        const updatedCase = { ...currentCase, lastContactAt: eventDate }
        try {
          await saveShared("sales_case", updatedCase)
          setSalesCases((current) => current.map((item) => item.id === salesCaseId ? updatedCase : item))
          setEditingSalesCase((current) => current?.id === salesCaseId ? { ...current, lastContactAt: eventDate } : current)
        } catch {
          alert("活動履歴は保存済みですが、最終接触日時を更新できませんでした。再読み込みして確認してください。")
        }
      }
    }
  }

  async function deleteShared(type: "work" | "customer" | "product" | "sales_case", id: string) {
    if (!(auth.configured && auth.authenticated)) return
    const response = await workboardFetch(
      `/api/workboard/data?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    )
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "共有DBからの削除に失敗しました。")
    if (result.trashed) setTrash((current) => [result.trashed, ...current.filter((item) => item.type !== type || item.id !== id)])
  }

  async function restoreRecord(item: TrashItem) {
    if (mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    try {
      const response = await workboardFetch("/api/workboard/data", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", type: item.type, id: item.id }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "復元できませんでした。")
      setSharedDataAttempt((current) => current + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : "復元できませんでした。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }



  async function importAiJson() {
    if (aiImportLock.current || aiReviewLock.current || aiLoading || aiLoadError || !aiImportJson.trim()) return
    aiImportLock.current = true
    setAiImportBusy(true)
    setAiImportMessage("")
    try {
      // Claude sometimes escapes characters such as @ and _ even though JSON does not allow those escapes.
      // Normalize only these known harmless cases before strict JSON parsing.
      const normalizedJson = aiImportJson
        .replace(/\\@/g, "@")
        .replace(/\\_/g, "_")
      const payload = JSON.parse(normalizedJson)
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "AI取込に失敗しました。")
      setAiImportMessage(`取込完了: ${result.candidateCount}件を候補として追加しました。`)
      setAiImportJson("")
      try {
        const refreshedData = await readAiImportData()
        setAiBatches(refreshedData.batches)
        setAiCandidates(refreshedData.candidates)
      } catch {
        setAiLoadError("取込は完了しましたが、候補一覧を更新できませんでした。再読み込みしてください。同じJSONを取り込み直す必要はありません。")
      }
    } catch (error) {
      setAiImportMessage(error instanceof Error ? error.message : "AI取込に失敗しました。")
    } finally {
      aiImportLock.current = false
      setAiImportBusy(false)
    }
  }

  async function reviewAiCandidate(id: string, status: AiImportCandidate["status"]) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiReviewError("")
    try {
      await updateAiCandidate(id, status)
    } catch (error) {
      setAiReviewError(error instanceof Error ? error.message : "候補の判定を保存できませんでした。")
    } finally {
      aiReviewLock.current = false
      setAiReviewBusy(false)
    }
  }




  function workUpdateTarget(candidate: AiImportCandidate) {
    return aiMatchWork[candidate.id] ?? String(candidate.payload?.work_item_id || candidate.target_id || "")
  }

  function workUpdatePreview(candidate: AiImportCandidate) {
    try {
      const patch = buildWorkUpdatePatch(candidate.payload || {})
      const selected = work.find((item) => item.id === workUpdateTarget(candidate))
      if (!selected) return { error: "更新する既存業務を選択してください。", rows: [], expected: {} }
      const rows = WORK_UPDATE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(patch, field.key)).map((field) => ({
        key: field.key, label: field.label, before: workUpdateValue(selected[field.uiKey]), after: workUpdateValue(patch[field.key]),
      }))
      return { error: "", rows, expected: Object.fromEntries(rows.map((row) => [row.key, row.before])) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "変更内容を確認してください。", rows: [], expected: {} }
    }
  }

  function toggleAiWorkEditField(key: string, enabled: boolean) {
    if (!aiEdit) return
    try {
      const payload = JSON.parse(aiEdit.payloadJson)
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error()
      const field = (aiEdit?.candidateType === "sales_case_update" ? SALES_CASE_UPDATE_FIELDS : WORK_UPDATE_FIELDS).find((item) => item.key === key)
      if (!field) return
      const currentKey = [field.key, ...field.aliases].find((name) => Object.prototype.hasOwnProperty.call(payload, name))
      const value = currentKey ? payload[currentKey] : (key === "status" ? "todo" : key === "stage" ? "uncontacted" : "")
      for (const name of [field.key, ...field.aliases]) delete payload[name]
      if (enabled) payload[key] = value
      setAiEdit({ ...aiEdit, payloadJson: JSON.stringify(payload, null, 2) })
    } catch {
      setAiEditError("詳細JSONの書式を直してから項目を編集してください。")
    }
  }

  function aiWorkEditFieldEnabled(key: string) {
    try {
      const payload = JSON.parse(aiEdit?.payloadJson || "{}")
      const field = (aiEdit?.candidateType === "sales_case_update" ? SALES_CASE_UPDATE_FIELDS : WORK_UPDATE_FIELDS).find((item) => item.key === key)
      return Boolean(field && [field.key, ...field.aliases].some((name) => Object.prototype.hasOwnProperty.call(payload, name)))
    } catch { return false }
  }

  function readAiWorkEditField(key: string) {
    try {
      const payload = JSON.parse(aiEdit?.payloadJson || "{}")
      const field = (aiEdit?.candidateType === "sales_case_update" ? SALES_CASE_UPDATE_FIELDS : WORK_UPDATE_FIELDS).find((item) => item.key === key)
      const name = field && [field.key, ...field.aliases].find((name) => Object.prototype.hasOwnProperty.call(payload, name))
      const value = name ? workUpdateValue(payload[name]) : ""
      if (key === "stage") return Object.entries(SALES_STAGE_LABELS).find(([id,label]) => id === value || label === value)?.[0] || value
      return key === "status" ? STATUSES.find((status) => status.id === value || status.label === value)?.id || value : value
    } catch { return "" }
  }

  async function applyAiWorkUpdate(candidate: AiImportCandidate) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    const preview = workUpdatePreview(candidate)
    if (preview.error) { setAiReviewError(preview.error); return }
    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiReviewError("")
    setAiEditMessage("")
    try {
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, candidate_type: "work_update", payload: { ...candidate.payload, work_item_id: workUpdateTarget(candidate) }, expectedWork: preview.expected }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "業務更新を反映できませんでした。")
      setAiCandidates((current) => current.map((item) => item.id === candidate.id ? {
        ...item, status: "approved", target_id: result.workId, decision_note: result.decisionNote || `既存業務 ${result.workId} を更新`,
      } : item))
      setAiEditMessage(result.warning || "既存業務に変更を反映しました。新しい業務は作成していません。")
      await refreshSharedAfterWrite()
    } catch (error) {
      setAiReviewError(error instanceof Error ? error.message : "業務更新を反映できませんでした。")
    } finally {
      aiReviewLock.current = false
      setAiReviewBusy(false)
    }
  }

  function caseUpdateTarget(candidate: AiImportCandidate) {
    return aiMatchCase[candidate.id] ?? String(candidate.payload?.sales_case_id || candidate.target_id || "")
  }

  function caseUpdatePreview(candidate: AiImportCandidate) {
    try {
      const patch = buildSalesCaseUpdatePatch(candidate.payload || {})
      const selected = salesCases.find((item) => item.id === caseUpdateTarget(candidate))
      if (!selected) return { error: "更新する既存案件BOXを選択してください。", rows: [], expected: {} }
      const rows = SALES_CASE_UPDATE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(patch, field.key)).map((field) => ({
        key: field.key, label: field.label, before: salesCaseUpdateValue(selected[field.uiKey]), after: salesCaseUpdateValue(patch[field.key]),
      }))
      return { error: "", rows, expected: Object.fromEntries(rows.map((row) => [row.key, row.before])) }
    } catch (error) { return { error: error instanceof Error ? error.message : "変更内容を確認してください。", rows: [], expected: {} } }
  }

  async function applyAiCaseUpdate(candidate: AiImportCandidate) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    const preview = caseUpdatePreview(candidate)
    if (preview.error) { setAiReviewError(preview.error); return }
    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiReviewError("")
    setAiEditMessage("")
    setAiCreatedBoxId("")
    try {
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, candidate_type: "sales_case_update", payload: { ...candidate.payload, sales_case_id: caseUpdateTarget(candidate) }, expectedCase: preview.expected }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "案件BOXを更新できませんでした。")
      if (!result.salesCaseId) throw new Error("更新結果を確認できません。再読み込みしてください。")
      setAiCandidates((current) => current.map((item) => item.id === candidate.id ? { ...item, status: "approved", target_id: result.salesCaseId, decision_note: result.decisionNote || `既存案件BOX ${result.salesCaseId} を更新` } : item))
      setAiCreatedBoxId(result.salesCaseId)
      setAiEditMessage(result.warning || (result.alreadyApplied ? "この案件BOX更新は反映済みです。" : result.noChange ? "案件BOXは既に提案どおりです。候補を反映済みにしました。" : "案件BOXを更新しました。段階を変更した場合は、その日時も記録しました。"))
      await refreshSharedAfterWrite()
    } catch (error) { setAiReviewError(error instanceof Error ? error.message : "案件BOXを更新できませんでした。") }
    finally { aiReviewLock.current = false; setAiReviewBusy(false) }
  }

  function openAiCandidateEditor(candidate: AiImportCandidate) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    setAiEditError("")
    setAiEditMessage("")
    setAiEdit({ id: candidate.id, title: candidate.title || "", candidateType: candidate.candidate_type, payloadJson: JSON.stringify(candidate.payload || {}, null, 2) })
  }

  function readAiEditField(key: string) {
    try { return String(JSON.parse(aiEdit?.payloadJson || "{}")[key] ?? "") } catch { return "" }
  }

  function changeAiEditField(key: string, value: string) {
    if (!aiEdit) return
    try {
      const payload = JSON.parse(aiEdit.payloadJson)
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error()
      if (aiEdit.candidateType === "sales_case_update") {
        const field = SALES_CASE_UPDATE_FIELDS.find((item) => item.key === key)
        if (field) for (const alias of field.aliases) delete payload[alias]
      }
      setAiEdit({ ...aiEdit, payloadJson: JSON.stringify({ ...payload, [key]: value }, null, 2) })
    } catch {
      setAiEditError("詳細JSONの書式を直してから項目を編集してください。")
    }
  }

  async function saveAiCandidateEdit(event: FormEvent) {
    event.preventDefault()
    if (!aiEdit || aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    setAiEditError("")
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(aiEdit.payloadJson)
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("詳細JSONはオブジェクト形式で入力してください。")
      if (!aiEdit.title.trim()) throw new Error("候補の件名を入力してください。")
      if (aiEdit.candidateType === "work_update") buildWorkUpdatePatch(payload)
      if (aiEdit.candidateType === "sales_case_update") buildSalesCaseUpdatePatch(payload)
    } catch (error) {
      setAiEditError(error instanceof SyntaxError ? "詳細JSONの書式が正しくありません。" : error instanceof Error ? error.message : "入力を確認してください。")
      return
    }
    aiReviewLock.current = true
    setAiReviewBusy(true)
    try {
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", id: aiEdit.id, title: aiEdit.title.trim(), candidateType: aiEdit.candidateType, payload }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "候補の修正を保存できませんでした。")
      const saved = result.candidate as AiImportCandidate | undefined
      if (!saved || saved.id !== aiEdit.id || !saved.payload || !saved.candidate_type) throw new Error("保存結果を確認できませんでした。再読み込みして内容を確認してください。")
      setAiCandidates((current) => current.map((item) => item.id === saved.id ? saved : item))
      setAiMatchCustomer((current) => { const next = { ...current }; delete next[saved.id]; return next })
      setAiMatchWork((current) => ({ ...current, [saved.id]: "" }))
      setAiMatchCase((current) => { const next = { ...current }; delete next[saved.id]; return next })
      setAiEventTarget((current) => ({ ...current, [saved.id]: "" }))
      setAiNewWorkStatus((current) => { const next = { ...current }; delete next[saved.id]; return next })
      setAiMatchProducts((current) => { const next = { ...current }; delete next[saved.id]; return next })
      setAiPriceClass((current) => ({ ...current, [saved.id]: "" }))
      setAiShippingStage((current) => ({ ...current, [saved.id]: "" }))
      setAiShippingDraft((current) => ({ ...current, [saved.id]: {} }))
      setAiPriceDraft((current) => ({ ...current, [saved.id]: {} }))
      setAiCostRows((current) => { const next = { ...current }; delete next[saved.id]; return next })
      setAiStatusFilter("pending")
      setAiTypeFilter("all")
      setAiEdit(null)
      setAiEditMessage("候補の修正を保存しました。まだ正式データには反映されていません。内容と紐付けを確認して正式反映してください。")
    } catch (error) {
      setAiEditError(error instanceof Error ? error.message : "候補の修正を保存できませんでした。")
    } finally {
      aiReviewLock.current = false
      setAiReviewBusy(false)
    }
  }


  async function applyAiWorkEvent(candidate: AiImportCandidate) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    const target = aiEventTarget[candidate.id] || ""
    const payload = { ...candidate.payload, work_item_id: null as string | null, sales_case_id: null as string | null }
    if (target.startsWith("sales:")) {
      const id = target.slice(6)
      if (!salesCases.some((item) => item.id === id)) { setAiReviewError("案件を選び直してください。"); return }
      payload.sales_case_id = id
    } else if (target.startsWith("work:")) {
      const id = target.slice(5)
      if (!work.some((item) => item.id === id)) { setAiReviewError("業務を選び直してください。"); return }
      payload.work_item_id = id
    } else if (target) { setAiReviewError("紐づけ先を選び直してください。"); return }
    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiReviewError("")
    setAiEditMessage("")
    try {
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, candidate_type: "work_event", title: candidate.title, payload }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "活動履歴を反映できませんでした。")
      setAiCandidates((current) => current.map((item) => item.id === candidate.id ? { ...item, status: "approved", decision_note: result.decisionNote || "業務履歴へ反映" } : item))
      setAiEditMessage(result.warning || (result.alreadyApplied ? "この候補の活動履歴は保存済みです。紐づけを変える場合は活動履歴の「案件の紐づけを変更」を使ってください。" : result.salesCaseId ? "案件に紐づけて活動履歴を保存しました。" : result.workId ? "業務に紐づけて活動履歴を保存しました。" : "単独の活動履歴として保存しました。"))
      await refreshSharedAfterWrite()
    } catch (error) {
      setAiReviewError(error instanceof Error ? error.message : "活動履歴を反映できませんでした。")
    } finally {
      aiReviewLock.current = false
      setAiReviewBusy(false)
    }
  }


  function boxCandidateDetails(candidate: AiImportCandidate) {
    const payload = candidate.payload || {}
    return {
      customerId: aiMatchCustomer[candidate.id] ?? String(payload.customer_id || ""),
      title: candidate.title || String(payload.title || ""),
      theme: String(payload.theme || candidate.title || ""),
      assignee: String(payload.assignee || auth.user?.displayName || auth.user?.email || ""),
      stage: String(payload.stage || "uncontacted"),
      caseType: String(payload.case_type || "new_business"),
      heat: String(payload.heat || "B"),
    }
  }

  function openImportedBox(id: string) {
    const box = salesCases.find((item) => item.id === id)
    if (!box) { setAiReviewError("対象の案件BOXを読み込めていません。画面を再読み込みしてください。"); return }
    setTab("sales")
    setEditingSalesCase({ ...box, productIds: [...(box.productIds || [])] })
    setSalesEventNote("")
  }

  async function applyAiSalesBox(candidate: AiImportCandidate) {
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError) return
    const details = boxCandidateDetails(candidate)
    if (!details.customerId || !customers.some((item) => item.id === details.customerId) || !details.title.trim() || !details.theme.trim() || !details.assignee.trim()) {
      setAiReviewError("取引先を選び、候補の案件名・テーマ・担当者を確認してください。")
      return
    }
    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiReviewError("")
    setAiEditMessage("")
    setAiCreatedBoxId("")
    try {
      const response = await workboardFetch("/api/workboard/ai-import", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, candidate_type: "new_sales_case", title: candidate.title, payload: { ...candidate.payload, customer_id: details.customerId, theme: details.theme, assignee: details.assignee } }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "案件BOXを作成できませんでした。")
      if (!result.salesCaseId) throw new Error("作成結果を確認できません。再読み込みして案件BOXを確認してください。")
      setAiCandidates((current) => current.map((item) => item.id === candidate.id ? { ...item, status: "approved", target_id: result.salesCaseId, decision_note: result.decisionNote || `案件BOX ${result.salesCaseId} を作成` } : item))
      setAiCreatedBoxId(result.salesCaseId)
      setAiEditMessage(result.warning || (result.alreadyApplied ? "この候補の案件BOXは作成済みです。" : "案件BOXを作成しました。「案件BOXを開く」から確認できます。"))
      await refreshSharedAfterWrite()
    } catch (error) {
      setAiReviewError(error instanceof Error ? error.message : "案件BOXを作成できませんでした。")
    } finally {
      aiReviewLock.current = false
      setAiReviewBusy(false)
    }
  }

  function newWorkCandidateStatus(candidate: AiImportCandidate): Status {
    const selected = aiNewWorkStatus[candidate.id]
    if (selected) return selected
    const proposed = String(candidate.payload?.status || "todo")
    return STATUSES.find((status) => status.id === proposed || status.label === proposed)?.id || "todo"
  }

  function candidateCustomer(candidate: AiImportCandidate) {
    return aiMatchCustomer[candidate.id] ?? String(candidate.payload?.customer_id || "")
  }

  function candidateProducts(candidate: AiImportCandidate): string[] {
    return aiMatchProducts[candidate.id] ?? (candidate.payload?.product_id ? [String(candidate.payload.product_id)] : Array.isArray(candidate.payload?.product_ids) ? candidate.payload.product_ids as string[] : [])
  }

  async function repairCaseStage(id: string) {
    if (mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    try {
      const response = await workboardFetch("/api/workboard/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "repair_case_stage", data: { id } }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "段階記録を修復できませんでした。")
      await refreshSharedAfterWrite()
    } catch (error) { alert(error instanceof Error ? error.message : "段階記録を修復できませんでした。") }
    finally { mutationLock.current = false; setMutationBusy(false) }
  }

  async function applyAiCandidate(candidate: AiImportCandidate) {
    if (candidate.candidate_type === "new_sales_case") { await applyAiSalesBox(candidate); return }
    if (candidate.candidate_type === "work_event") { await applyAiWorkEvent(candidate); return }
    if (aiReviewLock.current || aiImportLock.current || aiLoading || aiLoadError || isAiCandidateApplied(candidate.decision_note)) return
    aiReviewLock.current = true
    setAiReviewBusy(true)
    try {
    const payload = { ...(candidate.payload || {}) } as Record<string, unknown>
    if (candidate.candidate_type === "new_work") payload.status = newWorkCandidateStatus(candidate)

    if (["new_work", "customer_update", "price_candidate"].includes(candidate.candidate_type)) payload.customer_id = candidateCustomer(candidate) || null
    if (candidate.candidate_type === "product_update") payload.product_id = candidateProducts(candidate)[0] || null
    if (candidate.candidate_type === "new_work") {
      payload.product_ids = candidateProducts(candidate)
      if (!payload.assignee) payload.assignee = auth.user?.displayName || auth.user?.email || null
    }

    if (candidate.candidate_type === "price_candidate") {
      const selectedClass = aiPriceClass[candidate.id] || String(payload.price_classification || "")
      const selectedStage = aiShippingStage[candidate.id] || String(payload.shipping_stage || "")
      if (selectedClass) payload.price_classification = selectedClass
      if (selectedClass === "shipping_rate" && selectedStage) payload.shipping_stage = selectedStage
    }

    if (
      candidate.candidate_type === "price_candidate" &&
      String(payload.price_classification || "") === "shipping_rate"
    ) {
      const draft = aiShippingDraft[candidate.id] || {}
      if (draft.destination) payload.destination = draft.destination
      if (draft.amount) payload.amount = draft.amount
      if (draft.currency) payload.currency = draft.currency
      if (draft.carrier) payload.carrier = draft.carrier
      if (draft.service) payload.service = draft.service
      if (draft.weight_kg) payload.weight_kg = draft.weight_kg
      if (draft.shipment_date) payload.shipment_date = draft.shipment_date
      if (draft.actual_weight_kg) payload.actual_weight_kg = draft.actual_weight_kg
    }

    if (
      candidate.candidate_type === "price_candidate" &&
      String(payload.price_classification || "") === "supplier_cost"
    ) {
      const draft = aiPriceDraft[candidate.id] || {}
      if (draft.amount) payload.amount = draft.amount
      if (draft.currency) payload.currency = draft.currency
      if (draft.unit) payload.unit = draft.unit
      if (draft.effective_from) payload.effective_from = draft.effective_from
      if (draft.cost_type) payload.cost_type = draft.cost_type
      if (draft.supplier_or_vendor) payload.supplier_or_vendor = draft.supplier_or_vendor
      const selectedProduct = candidateProducts(candidate)[0]
      if (selectedProduct) payload.product_id = selectedProduct
    }

    if (
      candidate.candidate_type === "price_candidate" &&
      String(payload.price_classification || "") === "customer_quoted"
    ) {
      const draft = aiPriceDraft[candidate.id] || {}
      if (draft.amount) payload.amount = draft.amount
      if (draft.currency) payload.currency = draft.currency
      if (draft.unit) payload.unit = draft.unit
      if (draft.moq) payload.moq = draft.moq
      if (draft.effective_from) payload.effective_from = draft.effective_from
      if (draft.shipping_terms) payload.shipping_terms = draft.shipping_terms
      if (draft.payment_terms) payload.payment_terms = draft.payment_terms
      payload.customer_id = candidateCustomer(candidate) || null
      const selectedProduct = candidateProducts(candidate)[0]
      if (selectedProduct) payload.product_id = selectedProduct
    }

    const response = await workboardFetch("/api/workboard/ai-import", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: candidate.id,
        candidate_type: candidate.candidate_type,
        title: candidate.title,
        payload,
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "正式反映に失敗しました。")

    setAiCandidates((current) => current.map((item) => item.id === candidate.id ? { ...item, status: "approved", decision_note: result.decisionNote || "正式反映済み" } : item))
    await refreshSharedAfterWrite()
    } catch (error) {
      try { const data = await readAiImportData(); setAiCandidates(data.candidates); setAiBatches(data.batches) } catch { setAiLoadError("保存結果の確認が必要です。候補一覧を再読み込みしてください。") }
      throw error
    } finally { aiReviewLock.current = false; setAiReviewBusy(false) }
  }

  function toggleAiProduct(candidateId: string, productId: string) {
    setAiMatchProducts((current) => {
      const candidate = aiCandidates.find(item => item.id === candidateId)
      const selected = current[candidateId] ?? (candidate ? candidateProducts(candidate) : [])
      return {
        ...current,
        [candidateId]: selected.includes(productId)
          ? selected.filter((id) => id !== productId)
          : [...selected, productId],
      }
    })
  }


  function getAiCostRows(candidate: AiImportCandidate) {
    const existing = aiCostRows[candidate.id]
    if (existing?.length) return existing
    return [{
      id: uid(),
      cost_type: String(candidate.payload?.cost_type || "base_purchase"),
      label: candidate.title || "原価",
      amount: String(candidate.payload?.amount || candidate.payload?.price || candidate.payload?.cost || ""),
      currency: String(candidate.payload?.currency || "JPY"),
      unit: String(candidate.payload?.unit || "kg"),
      supplier_or_vendor: String(candidate.payload?.supplier_or_vendor || candidate.payload?.supplier || ""),
      effective_from: String(candidate.payload?.effective_from || ""),
    }]
  }

  function updateAiCostRow(candidate: AiImportCandidate, rowId: string, patch: Record<string, string>) {
    const rows = getAiCostRows(candidate)
    setAiCostRows((current) => ({
      ...current,
      [candidate.id]: rows.map((row) => row.id === rowId ? { ...row, ...patch } : row),
    }))
  }

  function addAiCostRow(candidate: AiImportCandidate) {
    const rows = getAiCostRows(candidate)
    setAiCostRows((current) => ({
      ...current,
      [candidate.id]: [
        ...rows,
        {
          id: uid(),
          cost_type: "processing",
          label: "",
          amount: "",
          currency: "JPY",
          unit: "kg",
          supplier_or_vendor: String(candidate.payload?.supplier_or_vendor || candidate.payload?.supplier || ""),
          effective_from: "",
        },
      ],
    }))
  }

  function removeAiCostRow(candidate: AiImportCandidate, rowId: string) {
    const rows = getAiCostRows(candidate)
    setAiCostRows((current) => ({
      ...current,
      [candidate.id]: rows.filter((row) => row.id !== rowId),
    }))
  }

  async function applyAiCostRows(candidate: AiImportCandidate) {
    const productId = candidateProducts(candidate)[0] || ""
    if (!productId) throw new Error("商品を選択してください。")
    const rows = getAiCostRows(candidate)
    const first = rows[0]
    if (!first) throw new Error("原価内訳を1件以上入力してください。")
    await applyAiCandidate({ ...candidate, payload: { ...candidate.payload, ...first, product_id: productId, price_classification: "supplier_cost", cost_rows: rows } })
  }

  async function savePriceClassification(candidate: AiImportCandidate) {
    const classification = aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")
    if (!classification) throw new Error("価格の種類を選んでください。")
    const shippingStage = aiShippingStage[candidate.id] || String(candidate.payload?.shipping_stage || "")
    if (classification === "shipping_rate" && !shippingStage) {
      throw new Error("送料の状態を選んでください。")
    }

    const response = await workboardFetch("/api/workboard/ai-import", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: candidate.id,
        status: "pending",
        decisionNote: null,
        payloadPatch: {
          price_classification: classification,
          ...(classification === "shipping_rate" ? { shipping_stage: shippingStage } : {}),
        },
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "価格分類を保存できませんでした。")

    setAiCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id
          ? {
              ...item,
              payload: {
                ...(item.payload || {}),
                price_classification: classification,
                ...(classification === "shipping_rate" ? { shipping_stage: shippingStage } : {}),
              },
            }
          : item
      )
    )
  }

  async function updateAiCandidate(id: string, status: AiImportCandidate["status"]) {
    const response = await workboardFetch("/api/workboard/ai-import", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "AI取込候補を更新できませんでした。")
    setAiCandidates((current) =>
      current.map((item) => (item.id === id ? { ...item, status, decision_note: result.decisionNote ?? item.decision_note } : item))
    )
  }

  function aiCandidateLabel(type: string) {
    const labels: Record<string, string> = {
      new_sales_case: "新規案件BOX",
      sales_case_update: "案件BOX更新",
      new_work: "新規業務",
      work_update: "業務更新",
      work_event: "活動履歴",
      customer_update: "取引先更新",
      product_update: "商品更新",
      price_candidate: "価格候補",
      decision: "要判断",
    }
    return labels[type] || type
  }

  const pendingAiCount = aiCandidates.filter((item) => item.status === "pending").length
  const visibleAiCandidates = aiCandidates.filter((item) => {
    const typeOk = aiTypeFilter === "all" || item.candidate_type === aiTypeFilter
    const statusOk = aiStatusFilter === "all" || item.status === aiStatusFilter
    return typeOk && statusOk
  })

  const supplierCostGroups = useMemo(() => {
    const groups: Record<string, AiImportCandidate[]> = {}
    for (const candidate of aiCandidates) {
      if (candidate.status !== "pending" || candidate.candidate_type !== "price_candidate" || isAiCandidateApplied(candidate.decision_note)) continue
      const classification = aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")
      if (classification !== "supplier_cost") continue
      const supplier = String(
        candidate.payload?.supplier_or_vendor ||
        candidate.payload?.supplier ||
        candidate.payload?.vendor ||
        "仕入先未設定"
      ).trim()
      const batch = aiBatches.find((item) => item.id === candidate.batch_id)
      const groupKey = supplier || batch?.session_title || "仕入原価候補"
      groups[groupKey] = [...(groups[groupKey] || []), candidate]
    }
    return Object.entries(groups).map(([key, candidates]) => ({ key, candidates }))
  }, [aiCandidates, aiBatches, aiPriceClass])

  async function applySupplierCostGroup(groupKey: string, candidates: AiImportCandidate[]) {
    if (aiReviewLock.current || aiImportLock.current) return
    const productId = aiCostGroupProduct[groupKey] || ""
    if (!productId) throw new Error("一括反映する商品を選択してください。")
    const vendor = aiCostGroupVendor[groupKey] || groupKey

    const prepared = candidates.map((candidate) => {
      const draft = aiPriceDraft[candidate.id] || {}
      const payload = { ...(candidate.payload || {}) } as Record<string, unknown>
      const amount = draft.amount || String(payload.amount || payload.price || payload.cost || "")
      const costType = draft.cost_type || String(payload.cost_type || "")
      if (!amount || !Number.isFinite(Number(String(amount).replace(/[,\\s¥￥]/g, "")))) {
        throw new Error("金額を確認してください: " + (candidate.title || "原価候補"))
      }
      if (!costType) {
        throw new Error("原価区分を選択してください: " + (candidate.title || "原価候補"))
      }
      return {
        candidate,
        payload: {
          ...payload,
          price_classification: "supplier_cost",
          product_id: productId,
          amount,
          cost_type: costType,
          currency: draft.currency || String(payload.currency || "JPY"),
          unit: draft.unit || String(payload.unit || "kg"),
          effective_from: draft.effective_from || String(payload.effective_from || ""),
          supplier_or_vendor: draft.supplier_or_vendor || vendor,
        },
      }
    })

    aiReviewLock.current = true
    setAiReviewBusy(true)
    setAiBulkCostBusy((current) => ({ ...current, [groupKey]: true }))
    try {
      for (const item of prepared) {
        const response = await workboardFetch("/api/workboard/ai-import", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.candidate.id,
            candidate_type: item.candidate.candidate_type,
            title: item.candidate.title,
            payload: item.payload,
          }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || "原価の一括反映に失敗しました。")
        setAiCandidates(current => current.map(candidate => candidate.id === item.candidate.id ? { ...candidate, status: "approved", decision_note: result.decisionNote || "原価履歴へ反映（一括）" } : candidate))
      }

      const approvedIds = new Set(candidates.map((candidate) => candidate.id))
      setAiCandidates((current) =>
        current.map((item) => approvedIds.has(item.id) ? { ...item, status: "approved", decision_note: "原価履歴へ反映（一括）" } : item)
      )

      await refreshSharedAfterWrite()
    } finally {
      try { const data = await readAiImportData(); setAiCandidates(data.candidates); setAiBatches(data.batches) } catch { setAiLoadError("候補の保存結果を確認できません。再読み込みしてください。") }
      aiReviewLock.current = false
      setAiReviewBusy(false)
      setAiBulkCostBusy((current) => ({ ...current, [groupKey]: false }))
    }
  }

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

  const currentProductCostSummary = useMemo(() => {
    if (!editingProduct) return { rows: [] as ProductCost[], total: 0, excluded: 0 }

    const normalizeUnit = (value?: string) => {
      const unit = (value || "kg").trim().toLowerCase().replace(/\s+/g, "")
      if (["kg", "/kg", "per_kg", "perkg", "1kg"].includes(unit)) return "kg"
      return unit
    }
    const normalizeCurrency = (value?: string) => (value || "JPY").trim().toUpperCase()

    const productRows = productCosts.filter((row) => row.productId === editingProduct.id)
    const sorted = [...productRows].sort((a, b) => {
      const aKey = [a.effectiveFrom || "", a.createdAt || "", a.id].join("|")
      const bKey = [b.effectiveFrom || "", b.createdAt || "", b.id].join("|")
      return bKey.localeCompare(aKey)
    })

    const latestByComponent = new Map<string, ProductCost>()
    for (const row of sorted) {
      const unit = normalizeUnit(row.unit)
      const currency = normalizeCurrency(row.currency)
      // 基準仕入原価は商品の土台なので、ラベル名が違っても最新1件だけを現在値として扱う。
      // その他の費用は、同じ区分・内訳名・仕入先を1つの構成要素として最新版だけ採用する。
      const key = row.costType === "base_purchase"
        ? [row.costType, unit, currency].join("|")
        : [
            row.costType,
            row.label.trim(),
            (row.supplierOrVendor || "").trim(),
            unit,
            currency,
          ].join("|")
      if (!latestByComponent.has(key)) latestByComponent.set(key, row)
    }

    const rows = Array.from(latestByComponent.values())
    const compatible = rows.filter(
      (row) => normalizeCurrency(row.currency) === "JPY" && normalizeUnit(row.unit) === "kg"
    )
    const total = compatible.reduce((sum, row) => {
      const amount = Number(row.amount)
      return Number.isFinite(amount) ? sum + amount : sum
    }, 0)

    return { rows: compatible, total, excluded: rows.length - compatible.length }
  }, [editingProduct, productCosts])

  const persistedEditingCase = editingSalesCase?.id ? salesCases.find((item) => item.id === editingSalesCase.id) : undefined
  const editingCaseDuration = persistedEditingCase ? stageDurations([persistedEditingCase], events, new Date().toISOString())[0] : undefined

  const activeCount = work.filter((item) => !["hold", "done"].includes(item.status)).length
  const waitingCount = work.filter((item) => ["external_wait", "internal_wait"].includes(item.status)).length
  const decisionCount = work.filter((item) => item.status === "decision").length
  const dueCount = work.filter((item) => item.dueDate && item.status !== "done").length
  const activeSalesCases = salesCases.filter((item) => !["won", "lost", "hold"].includes(item.stage))
  const overdueSalesCases = activeSalesCases.filter(
    (item) => item.nextFollowUpDate && item.nextFollowUpDate < todayInTokyo()
  )
  const aRankSalesCases = activeSalesCases.filter((item) => item.heat === "A")
  const visibleSalesCases = salesFilter === "overdue"
    ? overdueSalesCases
    : salesFilter === "a_rank" ? aRankSalesCases : activeSalesCases
  const salesFilterLabel = salesFilter === "a_rank" ? "Aランク案件" : "フォロー遅延"
  const salesCaseIds = new Set(salesCases.map((item) => item.id))
  const contactEvents = events.filter((event) =>
    event.salesCaseId && salesCaseIds.has(event.salesCaseId) &&
    ["email_sent", "contact_sent"].includes(event.eventType)
  )
  const contactCaseIds = new Set(contactEvents.map((event) => event.salesCaseId as string))
  const contactKeys = new Set(contactEvents
    .filter((event) => salesEventMedia(event))
    .map((event) => `${event.salesCaseId}:${salesEventMedia(event)}`))
  const repliedContactCaseIds = new Set(events
    .filter((event) => event.salesCaseId && event.eventType === "reply_received" &&
      salesEventMedia(event) && contactKeys.has(`${event.salesCaseId}:${salesEventMedia(event)}`))
    .map((event) => event.salesCaseId as string))
  const repliedContactCaseCount = repliedContactCaseIds.size
  const salesReplyRate = contactCaseIds.size
    ? `${Math.round(repliedContactCaseCount / contactCaseIds.size * 100)}%`
    : "—"

  const closedNewBusinessCases = salesCases.filter(
    (item) => item.caseType === "new_business" && ["won", "lost"].includes(item.stage)
  )
  const wonNewBusinessCases = closedNewBusinessCases.filter((item) => item.stage === "won")
  const salesWinRate = closedNewBusinessCases.length
    ? `${Math.round((wonNewBusinessCases.length / closedNewBusinessCases.length) * 100)}%`
    : "—"


  const countSalesCasesWithEvent = (eventType: string) =>
    new Set(
      events
        .filter((event) => event.eventType === eventType && event.salesCaseId && salesCaseIds.has(event.salesCaseId))
        .map((event) => event.salesCaseId)
    ).size
  const quotedSalesCaseCount = countSalesCasesWithEvent("quote_sent")
  const sampleSentSalesCaseCount = countSalesCasesWithEvent("sample_sent")

  const salesKpiGroups: string[] = salesKpiGroupBy === "channel"
    ? CHANNELS
    : ORIGINS.filter((origin): origin is NonNullable<WorkItem["originType"]> => Boolean(origin))
  const salesKpiGroupLabel = salesKpiGroupBy === "channel" ? "媒体" : "接点区分"
  const comparisonKpiRows = [...salesKpiGroups, "未設定"].map((label) => {
    const cases = salesCases.filter((item) => {
      const value = salesKpiGroupBy === "channel" ? item.channel : item.originType
      return (salesKpiGroups.includes(value || "") ? value : "未設定") === label
    })
    const sentCases = cases.filter((item) => contactCaseIds.has(item.id))
    const repliedCount = sentCases.filter((item) => repliedContactCaseIds.has(item.id)).length
    const closedCases = cases.filter((item) => item.caseType === "new_business" && ["won", "lost"].includes(item.stage))
    const wonCount = closedCases.filter((item) => item.stage === "won").length
    return {
      label,
      caseCount: cases.length,
      sentCount: sentCases.length,
      repliedCount,
      replyRate: sentCases.length ? `${Math.round(repliedCount / sentCases.length * 100)}%` : "—",
      closedCount: closedCases.length,
      wonCount,
      winRate: closedCases.length ? `${Math.round(wonCount / closedCases.length * 100)}%` : "—",
    }
  })

  const isSystemEvent = (event: WorkEvent) =>
    event.source === "workboard_auto" ||
    ["work_updated", "work_created", "status_changed"].includes(event.eventType)

  const salesActivityEvents = events.filter((event) => !isSystemEvent(event))
  const systemActivityEvents = events.filter((event) => isSystemEvent(event))
  const visibleActivityEvents =
    activityFilter === "sales"
      ? salesActivityEvents
      : activityFilter === "system"
        ? systemActivityEvents
        : events

  async function moveWork(id: string, status: Status) {
    const currentItem = work.find((item) => item.id === id)
    if (!currentItem || currentItem.status === status || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    const updated = { ...currentItem, status }
    setWork((current) => current.map((item) => (item.id === id ? updated : item)))
    try {
      await saveShared("work", updated)
      const beforeLabel = STATUSES.find((item) => item.id === currentItem.status)?.label || currentItem.status
      const afterLabel = STATUSES.find((item) => item.id === status)?.label || status
      await recordWorkChange(id, "status_changed", `状態変更: ${beforeLabel} → ${afterLabel}`)
    } catch (error) {
      console.error(error)
      setWork((current) => current.map((item) => (item.id === id ? currentItem : item)))
      alert(error instanceof Error ? error.message : "業務の状態を保存できませんでした。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function recordWorkChange(id: string, type: string, note: string) {
    try {
      await appendWorkEvent(id, type, note)
    } catch (error) {
      console.error(error)
      alert("業務の変更は保存済みですが、活動履歴を記録できませんでした。再読み込みして確認してください。")
    }
  }

  async function saveWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingWork || !editingWork.title.trim() || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    const item = editingWork
    const previous = work.find((row) => row.id === item.id)
    try {
      await saveShared("work", item)
      setWork((current) => {
        const exists = current.some((row) => row.id === item.id)
        return exists ? current.map((row) => row.id === item.id ? item : row) : [...current, item]
      })
      setEditingWork(null)

      if (!previous) {
        await recordWorkChange(item.id, "work_created", "業務を作成")
        return
      }

      const changes: string[] = []
      if (previous.status !== item.status) {
        const beforeLabel = STATUSES.find((row) => row.id === previous.status)?.label || previous.status
        const afterLabel = STATUSES.find((row) => row.id === item.status)?.label || item.status
        changes.push(`状態: ${beforeLabel} → ${afterLabel}`)
      }
      if ((previous.assignee || "") !== (item.assignee || "")) changes.push(`担当: ${previous.assignee || "未設定"} → ${item.assignee || "未設定"}`)
      if ((previous.priority || "") !== (item.priority || "")) changes.push(`優先度: ${previous.priority || "未設定"} → ${item.priority || "未設定"}`)
      if ((previous.dueDate || "") !== (item.dueDate || "")) changes.push(`期限: ${previous.dueDate || "未設定"} → ${item.dueDate || "未設定"}`)
      if ((previous.nextAction || "") !== (item.nextAction || "")) changes.push(`次アクション: ${previous.nextAction || "未設定"} → ${item.nextAction || "未設定"}`)

      if (changes.length) {
        await recordWorkChange(item.id, "work_updated", changes.join(" / "))
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "業務を保存できませんでした。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingCustomer || !editingCustomer.name.trim() || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    const item = editingCustomer
    try {
      await saveShared("customer", item)
      setCustomers((current) => {
        const exists = current.some((row) => row.id === item.id)
        return exists ? current.map((row) => row.id === item.id ? item : row) : [...current, item]
      })
      setEditingCustomer(null)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "取引先を保存できませんでした。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function deleteRecord(type: "work" | "customer" | "product" | "sales_case", id: string) {
    if (mutationLock.current || productSaveBusy || docUploadBusy) return
    mutationLock.current = true
    setMutationBusy(true)
    try {
      await deleteShared(type, id)
      if (type === "work") {
        setWork((current) => current.filter((item) => item.id !== id))
        setEditingWork(null)
      } else if (type === "customer") {
        setCustomers((current) => current.filter((item) => item.id !== id))
        setEditingCustomer(null)
      } else if (type === "product") {
        setProducts((current) => current.filter((item) => item.id !== id))
        setEditingProduct(null)
      } else {
        setSalesCases((current) => current.filter((item) => item.id !== id))
        setEditingSalesCase(null)
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "削除できませんでした。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingProduct || !editingProduct.name.trim() || productSaveBusy || docUploadBusy || mutationLock.current) return
    const item = editingProduct
    setProductSaveBusy(true)
    try {
      await saveShared("product", item)
      setProducts((current) => {
        const exists = current.some((row) => row.id === item.id)
        return exists ? current.map((row) => row.id === item.id ? item : row) : [...current, item]
      })
      setEditingProduct(null)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "商品を保存できませんでした。")
    } finally {
      setProductSaveBusy(false)
    }
  }

  async function uploadProductDoc(file: File) {
    if (!editingProduct || docUploadBusy) return
    const productId = editingProduct.id
    if (!(auth.configured && auth.authenticated) || !products.some((item) => item.id === productId)) {
      setDocUploadMessage("商品を共有DBに保存してから添付してください。")
      return
    }
    if (!file.size || file.size > 3 * 1024 * 1024) {
      setDocUploadMessage("空のファイルは添付できません。ファイルは3MB以下にしてください。")
      return
    }
    setDocUploadBusy(true)
    setDocUploadMessage("")
    try {
      const form = new FormData()
      form.set("productId", productId)
      form.set("file", file)
      const response = await workboardFetch("/api/workboard/documents", { method: "POST", body: form })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.doc) throw new Error(result.error || "資料を保存できませんでした。")
      const doc: ProductDoc = result.doc
      setEditingProduct((current) => current?.id === productId ? { ...current, docs: [...(current.docs || []), doc] } : current)
      setProducts((current) => current.map((product) => product.id === productId ? { ...product, docs: [...(product.docs || []), doc] } : product))
      setDocUploadMessage("非公開の資料を保存しました。")
    } catch (error) {
      setDocUploadMessage(error instanceof Error ? error.message : "資料を保存できませんでした。")
    } finally {
      setDocUploadBusy(false)
    }
  }

  function followupFromWon(source: SalesCase): SalesCase {
    const lastContact = salesCaseLastContact(source.id, source.lastContactAt)
    return {
      ...blankSalesCase(source.customerId),
      caseType: "existing_followup",
      theme: "次回注文フォロー",
      assignee: source.assignee,
      productIds: source.productIds || [],
      lastContactAt: lastContact || source.lastContactAt,
      wonAt: source.wonAt,
      nextAction: "次回注文時期を確認",
    }
  }

  function firstOrderFromWon(source: SalesCase): Order {
    const base = blankOrder(source.customerId, source.id)
    const productIds = source.productIds || []
    return {
      ...base,
      orderType: source.caseType === "new_business" ? "first" : "repeat",
      items: productIds.length
        ? productIds.map((productId) => ({
            id: uid(),
            productId,
            quantity: "",
            unit: "kg",
            unitPrice: "",
            lineAmount: "",
          }))
        : base.items,
    }
  }

  function blankOrder(customerId = "", salesCaseId = ""): Order {
    return {
      id: "",
      customerId,
      salesCaseId,
      orderType: "repeat",
      orderStatus: "confirmed",
      orderDate: todayInTokyo(),
      currency: "JPY",
      shippingAmount: "",
      totalAmount: "",
      externalOrderRef: "",
      note: "",
      items: [
        {
          id: uid(),
          productId: "",
          quantity: "",
          unit: "kg",
          unitPrice: "",
          lineAmount: "",
        },
      ],
    }
  }

  async function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingOrder?.customerId || !editingOrder.orderDate || !editingOrder.items.length || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)

    try {
      const response = await workboardFetch("/api/workboard/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order", data: editingOrder }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "受注履歴の保存に失敗しました。")

      const totalAmount = result.totalAmount == null ? editingOrder.totalAmount : String(result.totalAmount)
      const saved: Order = {
        ...editingOrder,
        id: result.id || editingOrder.id,
        totalAmount,
        items: editingOrder.items.map((item) => ({
          ...item,
          lineAmount:
            item.quantity && item.unitPrice
              ? String(Number(item.quantity) * Number(item.unitPrice))
              : item.lineAmount,
        })),
      }
      setOrders((current) => {
        const exists = current.some((row) => row.id === saved.id)
        return exists ? current.map((row) => row.id === saved.id ? saved : row) : [saved, ...current]
      })
      setEditingOrder(null)
      if (postOrderFollowupSource) {
        const source = postOrderFollowupSource
        setPostOrderFollowupSource(null)
        setEditingSalesCase(followupFromWon(source))
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "受注履歴の保存に失敗しました。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  function blankSalesCase(customerId = ""): SalesCase {
    const assignee = auth.user?.displayName || auth.user?.email || ""
    return {
      id: "",
      customerId,
      title: "",
      theme: "",
      caseType: "new_business",
      stage: "uncontacted",
      heat: "B",
      nextFollowUpDate: "",
      nextAction: "",
      assignee,
      productIds: [],
    }
  }

  async function saveSalesCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingSalesCase?.customerId || !editingSalesCase.theme.trim() || !editingSalesCase.assignee.trim() || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)

    const customer = customers.find((row) => row.id === editingSalesCase.customerId)
    const original = salesCases.find((row) => row.id === editingSalesCase.id)
    const becameWon =
      Boolean(editingSalesCase.id) &&
      editingSalesCase.stage === "won" &&
      original?.stage !== "won"
    const wonTimestamp = becameWon ? new Date().toISOString() : editingSalesCase.wonAt
    const autoTitle = [customer?.name || editingSalesCase.customerId, editingSalesCase.theme.trim()].filter(Boolean).join("｜")
    const item: SalesCase = {
      ...editingSalesCase,
      ...(salesAttributionConfigured ? { originType: editingSalesCase.originType || "", channel: editingSalesCase.channel || "" } : {}),
      title: editingSalesCase.title.trim() || autoTitle,
      wonAt: wonTimestamp,
      closedAt: becameWon ? wonTimestamp : editingSalesCase.closedAt,
    }

    try {
      const response = await workboardFetch("/api/workboard/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sales_case", data: { ...item, expectedStage: original?.stage } }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "案件の保存に失敗しました。")
      const saved = { ...item, id: result.id || item.id, wonAt: result.wonAt ?? item.wonAt, closedAt: result.closedAt ?? item.closedAt }
      setSalesCases((current) => {
        const exists = current.some((row) => row.id === saved.id)
        return exists ? current.map((row) => row.id === saved.id ? saved : row) : [saved, ...current]
      })
      if (result.stageEvent) setEvents((current) => [result.stageEvent, ...current.filter((event) => event.id !== result.stageEvent.id)])
      if (result.warning) alert(result.warning)
      setEditingSalesCase(null)
      if (becameWon) {
        setWonCreateOrder(true)
        setWonCreateFollowup(true)
        setWonFollowupSource(saved)
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "案件の保存に失敗しました。")
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  function blankWork(status: Status = "todo"): WorkItem {
    return {
      id: nextId([...work, ...trash.filter((item) => item.type === "work")], "W"),
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
      id: nextId([...customers, ...trash.filter((item) => item.type === "customer")], "C"),
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
      id: nextId([...products, ...trash.filter((item) => item.type === "product")], "M"),
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

  async function addProductCostCorrection() {
    if (!editingProduct) return
    const item: ProductCost = {
      id: uid(),
      productId: editingProduct.id,
      costType: (newProductCost.costType as ProductCost["costType"]) || "base_purchase",
      label: String(newProductCost.label || "").trim(),
      amount: String(newProductCost.amount || "").trim(),
      currency: String(newProductCost.currency || "JPY"),
      unit: String(newProductCost.unit || "kg"),
      effectiveFrom: String(newProductCost.effectiveFrom || new Date().toISOString().slice(0, 10)),
      supplierOrVendor: String(newProductCost.supplierOrVendor || ""),
      note: String(newProductCost.note || ""),
    }
    if (!item.label || !item.amount) {
      alert("原価名と金額を入力してください。")
      return
    }
    await saveShared("product_cost", item)
    setProductCosts((current) => [item, ...current])
    setNewProductCost({})
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
    if (sessionLock.current) return
    sessionLock.current = true
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
      const sessionData = await readWorkboardSession()
      if (!sessionData.authenticated) {
        setLoginError("このアカウントはWORKBOARDの利用許可がありません。")
        return
      }
      setHydrated(false)
      setAuth({
        loading: false,
        configured: true,
        authenticated: true,
        user: sessionData.user,
      })
      setLoginPassword("")
    } catch {
      setLoginError("ログインの確認に失敗しました。通信状態を確認して再度お試しください。")
    } finally {
      sessionLock.current = false
      setLoginBusy(false)
    }
  }

  async function logout() {
    if (sessionLock.current || mutationLock.current) return
    sessionLock.current = true
    setLogoutBusy(true)
    try {
      const response = await fetch("/api/workboard/auth/logout", { method: "POST" })
      if (!response.ok) throw new Error("ログアウトできませんでした。再度お試しください。")
      setHydrated(false)
      setEditingWork(null)
      setEditingCustomer(null)
      setEditingProduct(null)
      setEditingSalesCase(null)
      setEditingOrder(null)
      setEditingEventLink(null)
      setWonFollowupSource(null)
      setPostOrderFollowupSource(null)
      setAiImportJson("")
      setAiReviewError("")
      setAiLoadError("")
      setAiCandidates([])
      setAiBatches([])
      setWork([])
      setCustomers([])
      setProducts([])
      setSalesCases([])
      setOrders([])
      setEvents([])
      setTrash([])
      setProductCosts([])
      setShippingRates([])
      setAuth({ loading: false, configured: true, authenticated: false })
    } catch (error) {
      alert(error instanceof Error ? error.message : "ログアウトできませんでした。再度お試しください。")
    } finally {
      sessionLock.current = false
      setLogoutBusy(false)
    }
  }

  function salesCaseLastContact(caseId: string, stored?: string) {
    const contactTypes = new Set(["email_sent", "contact_sent", "reply_received", "contact_received", "quote_sent", "sample_sent"])
    const latestEvent = events
      .filter((event) => event.salesCaseId === caseId && contactTypes.has(event.eventType) && event.eventDate)
      .map((event) => event.eventDate)
      .sort((a, b) => b.localeCompare(a))[0]

    if (!stored) return latestEvent || ""
    if (!latestEvent) return stored
    return latestEvent > stored ? latestEvent : stored
  }

  function todayInTokyo() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
  }

  function followUpState(date?: string) {
    if (!date) return { label: "未設定", className: "bg-white/[0.045] text-white/75" }

    const today = todayInTokyo()

    if (date === today) {
      return { label: `${date} · 今日`, className: "bg-amber-400/10 text-amber-100" }
    }

    if (date > today) {
      return { label: date, className: "bg-white/[0.045] text-white/75" }
    }

    const start = new Date(`${date}T00:00:00+09:00`)
    const end = new Date(`${today}T00:00:00+09:00`)
    let businessDays = 0
    const cursor = new Date(start)
    cursor.setDate(cursor.getDate() + 1)

    while (cursor <= end) {
      const day = cursor.getDay()
      if (day !== 0 && day !== 6) businessDays += 1
      cursor.setDate(cursor.getDate() + 1)
    }

    if (businessDays >= 4) {
      return { label: `${date} · ${businessDays}営業日遅れ`, className: "bg-red-400/10 text-red-200" }
    }

    if (businessDays >= 1) {
      return { label: `${date} · ${businessDays}営業日遅れ`, className: "bg-amber-400/10 text-amber-100" }
    }

    return { label: `${date} · 期限超過`, className: "bg-amber-400/10 text-amber-100" }
  }

  if (authError) {
    return (
      <main className="fixed inset-0 z-[200] grid place-items-center bg-[#090a09] px-5 text-[#f4f5f2]">
        <div role="alert" className="max-w-md rounded-2xl border border-white/10 bg-[#111311] p-6">
          <p className="text-sm leading-6">{authError}</p>
          <button type="button" onClick={() => setAuthAttempt((current) => current + 1)} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm">再試行</button>
        </div>
      </main>
    )
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

  if (auth.configured && auth.authenticated && (sharedDataError || !hydrated)) {
    return (
      <main className="fixed inset-0 z-[200] grid place-items-center bg-[#090a09] px-5 text-[#f4f5f2]">
        {sharedDataError ? (
          <div role="alert" className="w-full max-w-md rounded-[24px] border border-amber-300/20 bg-[#111311] p-6">
            <h1 className="text-lg font-semibold">共有データを読み込めませんでした</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">{sharedDataError}</p>
            <button type="button" onClick={() => setSharedDataAttempt((attempt) => attempt + 1)} className="mt-5 rounded-full bg-[#eef3ea] px-5 py-2.5 text-sm font-medium text-[#11150f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
              再読み込み
            </button>
          </div>
        ) : (
          <div role="status" className="text-sm text-white/45">共有データを読み込み中...</div>
        )}
      </main>
    )
  }

  return (
    <main
      onClickCapture={(event) => {
        if (performance.now() < suppressClickSoundUntil.current || !(event.target instanceof Element)) return
        const target = event.target.closest("button, a, summary, [role='button'], [data-operation-sound]")
        if (!target || target.matches(":disabled, [aria-disabled='true']")) return
        playOperationSound("click", event.timeStamp)
      }}
      className="fixed inset-0 z-[200] overflow-hidden bg-[#090a09] text-[#f4f5f2]">
      <OperationSoundDiagnostics read={readSoundDiagnostics} />
      {aiEdit && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/75 p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="ai-edit-title" onSubmit={saveAiCandidateEdit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#111311] p-5 shadow-2xl">
            <h2 id="ai-edit-title" className="text-lg font-semibold">AI候補を編集</h2>
            <p className="mt-2 text-xs leading-5 text-white/55">保存すると未判定へ戻ります。候補だけの修正で、正式データへの反映は別操作です。分類を変える場合は、その分類に合う内容へ修正してください。</p>
            {aiEditError && <p role="alert" className="mt-3 text-sm text-red-300">{aiEditError}</p>}
            <fieldset disabled={aiReviewBusy} className="mt-4 space-y-4">
              <Field label={aiEdit.candidateType === "new_sales_case" ? "案件BOX名" : "候補の件名"}><input autoFocus value={aiEdit.title} onChange={(e) => setAiEdit({ ...aiEdit, title: e.target.value })} className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm" /></Field>
              <Field label="候補の分類"><select value={aiEdit.candidateType} onChange={(e) => setAiEdit({ ...aiEdit, candidateType: e.target.value })} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm">
                {["new_sales_case", "sales_case_update", "new_work", "work_update", "work_event", "customer_update", "product_update", "price_candidate", "decision"].map((type) => <option key={type} value={type}>{aiCandidateLabel(type)}</option>)}
              </select></Field>
              {aiEdit.candidateType === "customer_update" && <div className="grid gap-3 sm:grid-cols-2">
                {[["company_name", "会社名"], ["country", "国"], ["contact_name", "担当者"], ["email", "メール"], ["phone", "電話"], ["memo", "メモ"]].map(([key, label]) => <Field key={key} label={label}><input value={readAiEditField(key)} onChange={(e) => changeAiEditField(key, e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm" /></Field>)}
              </div>}

              {aiEdit.candidateType === "work_update" && <div className="space-y-3 rounded-xl border border-white/10 p-3">
                <p className="text-xs leading-5 text-white/55">変更する項目だけチェックしてください。チェックなしの項目はそのまま残ります。空欄で反映すると、その項目をクリアします（業務件名・状態を除く）。</p>
                {WORK_UPDATE_FIELDS.map((field) => {
                  const enabled = aiWorkEditFieldEnabled(field.key)
                  return <div key={field.key} className="space-y-1">
                    <label className="flex items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={enabled} onChange={(e) => toggleAiWorkEditField(field.key, e.target.checked)} />{field.label}を変更</label>
                    {enabled && (field.key === "status" ? <select aria-label="変更後の状態" value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key, e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm"><option value="">選択してください</option>{STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select> :
                    field.key === "priority" ? <select aria-label="変更後の優先度" value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key, e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm"><option value="">未設定にする</option>{["低","中","高","緊急"].map((value) => <option key={value}>{value}</option>)}</select> :
                    field.key === "origin_type" || field.key === "channel" || field.key === "work_type" ? <select aria-label={`変更後の${field.label}`} value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key, e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm"><option value="">未設定にする</option>{(field.key === "origin_type" ? ["Outbound","Inbound","Referral","Existing"] : field.key === "channel" ? CHANNELS : WORK_TYPES).map((value) => <option key={value}>{value}</option>)}</select> :
                    <input aria-label={`変更後の${field.label}`} type={field.key === "due_date" ? "date" : "text"} value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key, e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm" />)}
                  </div>
                })}
              </div>}

              {aiEdit.candidateType === "sales_case_update" && <div className="space-y-3 rounded-xl border border-white/10 p-3">
                <p className="text-xs leading-5 text-white/55">変更する項目だけチェックしてください。指定しない項目は維持します。更新先の案件BOXは候補保存後に選びます。段階変更の日時は正式反映時に記録します。</p>
                {SALES_CASE_UPDATE_FIELDS.map((field) => {
                  const enabled = aiWorkEditFieldEnabled(field.key)
                  const choices: [string, string][] | null = field.key === "stage" ? Object.entries(SALES_STAGE_LABELS) : field.key === "heat" ? ["A","B","C"].map((value) => [value,value]) : field.key === "case_type" ? [["new_business","新規商談"],["existing_followup","既存フォロー"]] : field.key === "origin_type" ? ["Outbound","Inbound","Referral","Existing"].map((value) => [value,value]) : field.key === "channel" ? CHANNELS.map((value) => [value,value]) : null
                  return <div key={field.key} className="space-y-1">
                    <label className="flex items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={enabled} onChange={(e) => toggleAiWorkEditField(field.key,e.target.checked)} />{field.label}を変更</label>
                    {enabled && (choices ? <select aria-label={`変更後の${field.label}`} value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key,e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm"><option value="">選択してください</option>{choices.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select> : <input aria-label={`変更後の${field.label}`} type={field.key === "next_follow_up_date" ? "date" : "text"} value={readAiWorkEditField(field.key)} onChange={(e) => changeAiEditField(field.key,e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm" />)}
                  </div>
                })}
              </div>}

              {aiEdit.candidateType === "new_sales_case" && <div className="space-y-3 rounded-xl border border-white/10 p-3">
                <p className="text-xs leading-5 text-white/55">取引先は候補保存後に選びます。新しい取引先なら、取引先候補を先に反映してください。テーマ未入力時は案件BOX名、担当者未入力時はログイン中の利用者を作成前の確認欄に表示します。</p>
                {[["theme","テーマ"],["assignee","担当者"],["next_follow_up_date","次回フォロー日"],["next_action","次のアクション"]].map(([key,label]) => <Field key={key} label={label}><input type={key === "next_follow_up_date" ? "date" : "text"} value={readAiEditField(key)} onChange={(e) => changeAiEditField(key,e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm" /></Field>)}
                <Field label="案件区分"><select value={readAiEditField("case_type") || "new_business"} onChange={(e) => changeAiEditField("case_type",e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm"><option value="new_business">新規商談</option><option value="existing_followup">既存フォロー</option></select></Field>
                <Field label="状態"><select value={readAiEditField("stage") || "uncontacted"} onChange={(e) => changeAiEditField("stage",e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm">{Object.entries(SALES_STAGE_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
                <Field label="温度感"><select value={readAiEditField("heat") || "B"} onChange={(e) => changeAiEditField("heat",e.target.value)} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-3 text-sm">{["A","B","C"].map((value) => <option key={value}>{value}</option>)}</select></Field>
              </div>}
              <details open={aiEdit.candidateType !== "customer_update" && aiEdit.candidateType !== "work_update" && aiEdit.candidateType !== "new_sales_case"} className="rounded-xl border border-white/10">
                <summary className="cursor-pointer px-3 py-2 text-xs text-white/65">詳細JSONを編集</summary>
                <p className="px-3 text-xs leading-5 text-white/45">通常の取引先修正は上の項目で入力できます。その他の分類や項目はここで修正します。確認できた内容だけを書き換えてください。</p>
                <textarea aria-label="候補の詳細JSON" spellCheck={false} value={aiEdit.payloadJson} onChange={(e) => setAiEdit({ ...aiEdit, payloadJson: e.target.value })} className="mt-2 min-h-56 w-full rounded-b-xl bg-black/25 p-3 font-mono text-xs leading-5" />
              </details>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => { setAiEdit(null); setAiEditError("") }} className="rounded-full border border-white/15 px-4 py-2 text-sm">キャンセル</button><button type="submit" className="rounded-full bg-[#eef3ea] px-4 py-2 text-sm font-semibold text-[#11150f]">{aiReviewBusy ? "保存中…" : "修正を保存"}</button></div>
            </fieldset>
          </form>
        </div>
      )}
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 bg-[#090a09]/95 px-5 py-4 backdrop-blur md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <span className="inline-block size-2 rounded-full bg-[#66845c]" />
                SHOJUEN WORKBOARD
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                {tab === "analysis" ? "経営分析" : tab === "trash" ? "ゴミ箱" : tab === "sales" ? "案件" : tab === "orders" ? "受注履歴" : tab === "work" ? "業務管理" : tab === "activity" ? "活動履歴" : tab === "customers" ? "取引先マスタ" : tab === "products" ? "商品マスタ" : tab === "shipping" ? "送料マスタ" : "AI取込候補"}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {tab === "analysis" && "案件の進み方・営業方法・受注の継続を、グラフと詳細KPIで確認。"}
                {tab === "sales" &&
                  "取引先ごとの商談を、ステージ・温度感・フォロー日で管理。"}
                {tab === "orders" &&
                  "初回発注・リピート発注を、商品・数量・金額・関連案件とともに履歴化。"}
                {tab === "work" &&
                  "営業・仕入・物流・証明書・HPなど、全社の仕事を状態で見える化。"}
                {tab === "activity" &&
                  "メール送信・返信・書類受領など、すでに起きた事実を時系列で確認。"}
                {tab === "customers" &&
                  "取引先情報と確定済み取引条件を管理。AIはここにない価格を推測しない。"}
                {tab === "products" &&
                  "商品ID・特徴・原価・卸価格・証明書を一元管理。"}
                {tab === "shipping" &&
                  "配送先・重量・配送方法ごとの概算、提示済み送料、実績を分けて管理。"}
                {tab === "trash" && "ゴミ箱へ移動したデータを確認し、元の一覧に戻せます。"}
                {tab === "ai" &&
                  "ChatGPT・Claudeの会話から抽出した候補を確認し、正式データにする前に承認・却下。"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {auth.configured && auth.authenticated && (
                <button disabled={logoutBusy || mutationBusy || salesEventBusy || docUploadBusy || productSaveBusy || aiImportBusy || aiReviewBusy} onClick={logout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/55 hover:bg-white/10">
                  {logoutBusy ? "ログアウト中..." : "ログアウト"}
                </button>
              )}
            {tab !== "analysis" && tab !== "ai" && tab !== "activity" && tab !== "shipping" && tab !== "trash" && (
              <button
                onClick={() => {
                  if (tab === "sales") setEditingSalesCase(blankSalesCase())
                  if (tab === "orders") setEditingOrder(blankOrder())
                  if (tab === "work") setEditingWork(blankWork())
                  if (tab === "customers") setEditingCustomer(blankCustomer())
                  if (tab === "products") setEditingProduct(blankProduct())
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-medium text-[#11150f] transition hover:bg-white"
              >
                <Plus className="size-4" />
                {tab === "sales" ? "案件を追加" : tab === "orders" ? "受注を追加" : tab === "work" ? "業務を追加" : tab === "customers" ? "取引先を追加" : "商品を追加"}
              </button>
            )}
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1">
            <TabButton active={tab === "sales"} onClick={() => setTab("sales")} icon={<Building2 className="size-4" />} label={"案件" + (salesCases.length ? " (" + salesCases.length + ")" : "")} />
            <TabButton active={tab === "work"} onClick={() => setTab("work")} icon={<BarChart3 className="size-4" />} label="業務管理" />
            <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<FileText className="size-4" />} label={"受注履歴" + (orders.length ? " (" + orders.length + ")" : "")} />
            <TabButton active={tab === "activity"} onClick={() => setTab("activity")} icon={<Activity className="size-4" />} label={"活動履歴" + (events.length ? " (" + events.length + ")" : "")} />
            <TabButton active={tab === "analysis"} onClick={() => setTab("analysis")} icon={<BarChart3 className="size-4" />} label="経営分析" />
            <TabButton active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="size-4" />} label="取引先マスタ" />
            <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="size-4" />} label="商品マスタ" />
            <TabButton active={tab === "shipping"} onClick={() => setTab("shipping")} icon={<Truck className="size-4" />} label={"送料マスタ" + (shippingRates.length ? " (" + shippingRates.length + ")" : "")} />
            <TabButton active={tab === "ai"} onClick={() => setTab("ai")} icon={<Bot className="size-4" />} label={`AI取込候補${pendingAiCount ? ` (${pendingAiCount})` : ""}`} />
            <TabButton active={tab === "trash"} onClick={() => setTab("trash")} icon={<Trash2 className="size-4" />} label={`ゴミ箱 (${trash.length})`} />
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

{tab === "orders" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="受注件数" value={orders.filter((order) => order.orderStatus !== "cancelled").length} />
                <Kpi label="初回発注" value={orders.filter((order) => order.orderType === "first" && order.orderStatus !== "cancelled").length} />
                <Kpi label="リピート" value={orders.filter((order) => order.orderType === "repeat" && order.orderStatus !== "cancelled").length} />
                <Kpi label="取引先数" value={new Set(orders.filter((order) => order.orderStatus !== "cancelled").map((order) => order.customerId)).size} />
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
                  <FileText className="mx-auto size-7 text-white/30" />
                  <h2 className="mt-3 text-base font-semibold">受注履歴はまだありません</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    本発注・リピート発注をここに蓄積して、継続率や累計売上のKPIにつなげます。
                  </p>
                  <button type="button" data-operation-sound="click" onClick={() => setEditingOrder(blankOrder())} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-medium text-[#11150f]">
                    <Plus className="size-4" /> 最初の受注を追加
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const customer = customers.find((row) => row.id === order.customerId)
                    return (
                      <article key={order.id} className="rounded-[20px] border border-white/10 bg-[#111311] p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-xs text-white/40">{customer?.name || order.customerId}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold">{order.orderDate}</h2>
                              <Tag>{order.orderType === "first" ? "初回発注" : "リピート"}</Tag>
                              <Tag>{order.orderStatus === "confirmed" ? "受注確定" : order.orderStatus === "shipped" ? "発送済み" : order.orderStatus === "completed" ? "完了" : "キャンセル"}</Tag>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-semibold tracking-[0.1em] text-white/35">受注総額</div>
                            <div className="mt-1 text-lg font-semibold">
                              {order.totalAmount
                                ? `${order.currency} ${Number(order.totalAmount).toLocaleString("ja-JP")}`
                                : "未計算"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          {(order.items || []).map((item) => {
                            const product = products.find((row) => row.id === item.productId)
                            return (
                              <div key={item.id} className="rounded-xl bg-white/[0.045] p-3">
                                <div className="text-sm font-medium">{product?.name || item.productId}</div>
                                <div className="mt-1 text-xs text-white/45">
                                  {item.quantity}{item.unit} × {order.currency} {Number(item.unitPrice || 0).toLocaleString("ja-JP")}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {(order.shippingAmount || order.externalOrderRef || order.note) && (
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/40">
                            {order.shippingAmount && <span>送料 {order.currency} {Number(order.shippingAmount).toLocaleString("ja-JP")}</span>}
                            {order.externalOrderRef && <span>注文番号 {order.externalOrderRef}</span>}
                            {order.note && <span>{order.note}</span>}
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

{tab === "trash" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-3">
              <p className="text-sm leading-6 text-white/55">履歴・価格・商品との紐づけ・添付ファイルは保持されています。復元すると同じIDで戻ります。関連する別のデータもゴミ箱にある場合は、それぞれ復元してください。</p>
              {!trashConfigured ? (
                <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">ゴミ箱用のDB更新が必要です。更新が済むまで削除はできません。</p>
              ) : trash.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/40">ゴミ箱は空です。</p>
              ) : trash.map((item) => (
                <article key={`${item.type}:${item.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><Tag>{TRASH_LABELS[item.type]}</Tag><span className="text-xs text-white/35">{item.id}</span></div>
                    <h2 className="mt-2 break-words text-sm font-semibold">{item.title}</h2>
                    <p className="mt-1 text-xs text-white/40">移動日時：{new Date(item.deletedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
                  </div>
                  <button type="button" disabled={mutationBusy || (["sales_case", "order"].includes(item.type) && !["owner", "admin"].includes(auth.user?.role || ""))} onClick={() => restoreRecord(item)} className="rounded-full bg-[#eef3ea] px-4 py-2 text-sm font-semibold text-[#11150f] disabled:opacity-40">{mutationBusy ? "処理中..." : "復元"}</button>
                </article>
              ))}
              <p className="text-xs leading-5 text-white/35">案件・受注の復元は管理者が行います。この機能を導入する前に完全削除したデータは表示されません。</p>
            </div>
          </section>
        )}

        {tab === "analysis" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs leading-5 text-white/50">
                滞在日数は記録開始後の期間、月次推移は直近12か月です。累計KPI・現在の件数も補助として表示します。案件ページの絞り込みとは連動しません。
              </div>
              <StageTimeAnalysis cases={salesCases} events={events} labels={SALES_STAGE_LABELS} now={new Date().toISOString()} onOpen={(id) => { const item = salesCases.find((row) => row.id === id); if (item) setEditingSalesCase({ ...item }) }} />
              <AnalysisOverview
                stages={Object.entries(SALES_STAGE_LABELS).map(([id, label]) => ({ id, label, count: salesCases.filter((item) => item.stage === id).length }))}
                months={monthlyOrderRows(orders, todayInTokyo())}
              />
              <details open className="mb-4 rounded-2xl border border-white/10 bg-white/[0.025]">
                <summary className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                  <BarChart3 className="size-4 text-white/45" />
                  詳細KPI（見積・サンプル）
                  <ChevronDown className="ml-auto size-4 text-white/45" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="mb-3 text-xs leading-5 text-white/45">
                    全案件の累計です。成約・失注・保留、既存顧客対応も含みます。フォロー遅延の絞り込みとは連動しません。履歴が未登録の案件は含まれません。
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Kpi label="見積提示案件" value={`${quotedSalesCaseCount}件`} detail="見積提示の履歴がある案件" description="同じ案件で複数回提示しても1件として集計。" />
                    <Kpi label="サンプル送付案件" value={`${sampleSentSalesCaseCount}件`} detail="サンプル送付の履歴がある案件" description="同じ案件で複数回送付しても1件として集計。要求のみの案件は除外。" />
                  </div>
                </div>
              </details>

              <details open className="mb-4 rounded-2xl border border-white/10 bg-white/[0.025]">
                <summary className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                  <BarChart3 className="size-4 text-white/45" />
                  媒体・接点区分別KPI
                  <ChevronDown className="ml-auto size-4 text-white/45" />
                </summary>
                <div className="px-4 pb-4">
                  <label className="mb-3 block max-w-xs text-xs text-white/60">
                    比較する項目
                    <select className={inputClass + " mt-2"} value={salesKpiGroupBy} onChange={(e) => setSalesKpiGroupBy(e.target.value as "channel" | "originType")}>
                      <option value="channel">媒体別</option>
                      <option value="originType">接点区分別</option>
                    </select>
                  </label>
                  <p id="media-kpi-description" className="mb-3 text-xs leading-5 text-white/45">
                    案件の{salesKpiGroupLabel}ごとの累計です。返信・反応率は、こちらから連絡した案件のうち、同じ連絡媒体で返信・反応の記録がある案件の割合です。複数回の連絡は1案件として集計し、初回受信のみは分母に含めません。成約率は新規営業の成約・失注が対象です。未登録は未設定に表示し、案件の絞り込みとは連動しません。
                  </p>
                  <MonthlySalesChart cases={salesCases} events={events} groupBy={salesKpiGroupBy} groups={salesKpiGroups} today={todayInTokyo()} />
                  <ComparisonChart rows={comparisonKpiRows} />
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table aria-describedby="media-kpi-description" className="w-full min-w-[520px] text-left text-xs">
                      <caption className="sr-only">案件の{salesKpiGroupLabel}ごとの案件数・返信反応率・新規営業成約率</caption>
                      <thead className="bg-white/[0.045] text-white/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-medium">{salesKpiGroupLabel}</th>
                          <th scope="col" className="px-4 py-3 text-right font-medium">案件数</th>
                          <th scope="col" className="px-4 py-3 text-right font-medium">返信・反応率</th>
                          <th scope="col" className="px-4 py-3 text-right font-medium">新規営業成約率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonKpiRows.map((row) => (
                          <tr key={row.label} className="border-t border-white/10">
                            <th scope="row" className="px-4 py-3 font-medium text-white/75">{row.label}</th>
                            <td className="px-4 py-3 text-right text-white/75">{row.caseCount}件</td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-medium text-white/75">{row.replyRate}</div>
                              <div className="mt-1 text-[10px] text-white/40">反応 {row.repliedCount} ／ 連絡 {row.sentCount}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-medium text-white/75">{row.winRate}</div>
                              <div className="mt-1 text-[10px] text-white/40">成約 {row.wonCount} ／ 決着 {row.closedCount}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>

            </div>
          </section>
        )}

        {tab === "sales" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="返信・反応率" value={salesReplyRate} detail={`反応 ${repliedContactCaseCount}件 ／ 連絡 ${contactCaseIds.size}件`} description="こちらから連絡した案件が対象。同じ媒体で返信・反応を記録した案件を1件として集計。" />
                <Kpi label="成約率" value={salesWinRate} detail={`成約 ${wonNewBusinessCases.length}件 ／ 決着 ${closedNewBusinessCases.length}件`} description="新規営業の成約・失注が対象。進行中・保留・既存顧客対応は除外。" />
                <Kpi label="フォロー遅延" value={overdueSalesCases.length} detail="押すと遅延案件を表示" onClick={() => setSalesFilter((current) => current === "overdue" ? "all" : "overdue")} active={salesFilter === "overdue"} />
                <Kpi label="Aランク案件" value={aRankSalesCases.length} detail="押すとAランク案件を表示" onClick={() => setSalesFilter((current) => current === "a_rank" ? "all" : "a_rank")} active={salesFilter === "a_rank"} />
              </div>

              {salesFilter !== "all" && (
                <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3">
                  <p className="text-sm text-amber-100">{salesFilterLabel}のみ表示中：{visibleSalesCases.length}件</p>
                  <button type="button" onClick={() => setSalesFilter("all")} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                    すべて表示
                  </button>
                </div>
              )}

              {salesFilter !== "all" && visibleSalesCases.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
                  <CalendarClock className="mx-auto size-7 text-white/30" />
                  <h2 className="mt-3 text-base font-semibold">{salesFilterLabel}の案件はありません</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {salesFilter === "a_rank" ? "成約・失注・保留を除く、進行中のAランク案件を表示します。" : "次回フォロー日が今日より前の進行中案件を表示します。"}
                  </p>
                </div>
              ) : salesCases.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
                  <Building2 className="mx-auto size-7 text-white/30" />
                  <h2 className="mt-3 text-base font-semibold">案件はまだありません</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">取引先ごとの商談をここで管理します。</p>
                  <button type="button" data-operation-sound="click" onClick={() => setEditingSalesCase(blankSalesCase())} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-medium text-[#11150f]">
                    <Plus className="size-4" /> 最初の案件を作る
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visibleSalesCases
                    .slice()
                    .sort((a, b) => {
                      const heatOrder = { A: 0, B: 1, C: 2 }
                      const heatDiff = heatOrder[a.heat] - heatOrder[b.heat]
                      if (heatDiff !== 0) return heatDiff
                      const aDate = a.nextFollowUpDate || "9999-12-31"
                      const bDate = b.nextFollowUpDate || "9999-12-31"
                      if (aDate !== bDate) return aDate.localeCompare(bDate)
                      return salesCaseLastContact(a.id, a.lastContactAt).localeCompare(salesCaseLastContact(b.id, b.lastContactAt))
                    })
                    .map((item) => {
                      const customer = customers.find((row) => row.id === item.customerId)
                      return (
                        <article
                          key={item.id}
                          data-operation-sound="click"
                          onClick={() => setEditingSalesCase(item)}
                          className="cursor-pointer rounded-[20px] border border-white/10 bg-[#111311] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs text-white/40">{customer?.name || item.customerId}</div>
                              <h2 className="mt-1 break-words text-base font-semibold leading-6">{item.title || item.theme}</h2>
                              {item.theme && item.theme !== item.title && <p className="mt-1 break-words text-xs leading-5 text-white/40">テーマ：{item.theme}</p>}
                            </div>
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              item.heat === "A" ? "bg-red-400/15 text-red-200" :
                              item.heat === "B" ? "bg-amber-400/15 text-amber-100" :
                              "bg-white/10 text-white/55"
                            }`}>
                              {item.heat}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            <Tag>{SALES_STAGE_LABELS[item.stage]}</Tag>
                            <Tag>{item.caseType === "new_business" ? "新規営業" : "既存顧客"}</Tag>
                            <Tag>{(item.productIds || []).length}商品</Tag>
                          </div>
                          <div className={`mt-4 rounded-xl p-3 ${followUpState(item.nextFollowUpDate).className}`}>
                            <div className="text-[10px] font-semibold tracking-[0.1em] opacity-60">次回フォロー</div>
                            <div className="mt-1 text-sm">{followUpState(item.nextFollowUpDate).label}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/35">
                            <span>{item.assignee || "未担当"}</span>
                            <span className={salesCaseLastContact(item.id, item.lastContactAt) ? "text-white/50" : ""}>
                              {salesCaseLastContact(item.id, item.lastContactAt)
                                ? `最終接触 ${new Date(salesCaseLastContact(item.id, item.lastContactAt)).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`
                                : "接触記録なし"}
                            </span>
                          </div>
                        </article>
                      )
                    })}
                </div>
              )}

              {salesFilter === "all" && salesCases.some((item) => ["won", "lost", "hold"].includes(item.stage)) && (
                <section className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">クローズ済み案件</h2>
                      <p className="mt-1 text-xs text-white/40">成約・失注・保留になった案件。履歴はここに残ります。</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/50">
                      {salesCases.filter((item) => ["won", "lost", "hold"].includes(item.stage)).length}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {salesCases
                      .filter((item) => ["won", "lost", "hold"].includes(item.stage))
                      .sort((a, b) => (b.closedAt || b.updatedAt || "").localeCompare(a.closedAt || a.updatedAt || ""))
                      .map((item) => {
                        const customer = customers.find((row) => row.id === item.customerId)
                        return (
                          <article
                            key={item.id}
                            data-operation-sound="click"
                            onClick={() => setEditingSalesCase(item)}
                            className="cursor-pointer rounded-[20px] border border-white/10 bg-white/[0.02] p-5 opacity-80 transition hover:border-white/20 hover:opacity-100"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs text-white/40">{customer?.name || item.customerId}</div>
                                <h3 className="mt-1 break-words text-sm font-semibold leading-5">{item.title || item.theme}</h3>
                                {item.theme && item.theme !== item.title && <p className="mt-1 break-words text-xs leading-5 text-white/40">テーマ：{item.theme}</p>}
                              </div>
                              <Tag>{SALES_STAGE_LABELS[item.stage]}</Tag>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <Tag>{item.caseType === "new_business" ? "新規営業" : "既存顧客"}</Tag>
                              <Tag>{(item.productIds || []).length}商品</Tag>
                            </div>
                            <div className="mt-3 text-xs text-white/35">
                              {item.stage === "won" && item.wonAt
                                ? `成約 ${new Date(item.wonAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`
                                : item.closedAt
                                  ? `クローズ ${new Date(item.closedAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`
                                  : "クローズ済み"}
                            </div>
                          </article>
                        )
                      })}
                  </div>
                </section>
              )}
            </div>
          </section>
        )}



        {tab === "work" && (
          <section data-work-board className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
            <div className="flex h-full min-w-max gap-3">
              {STATUSES.map((status) => {
                const items = filteredWork.filter((item) => item.status === status.id)
                return (
                  <section
                    key={status.id}
                    data-work-column={status.id}
                    className="flex h-full w-[310px] flex-col rounded-[20px] border border-white/10 bg-white/[0.035] p-3 [&[data-work-drag-over=true]]:border-[#a2bd8b]"
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
                            draggable={false}
                            onPointerDown={(event) => {
                              if (!mutationBusy && !mutationLock.current) workDrag.begin(event.nativeEvent, event.currentTarget, item.id)
                            }}
                            data-operation-sound="click"
                            onClick={() => { if (performance.now() >= suppressClickSoundUntil.current) setEditingWork(item) }}
                            className="cursor-grab select-none rounded-2xl border border-white/10 bg-[#111311] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
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
                        data-operation-sound="click"
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

        {tab === "activity" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                <Kpi label="営業活動" value={salesActivityEvents.length} />
                <Kpi label="変更履歴" value={systemActivityEvents.length} />
                <Kpi label="履歴合計" value={events.length} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
                {[
                  { id: "sales" as const, label: "営業活動", count: salesActivityEvents.length },
                  { id: "system" as const, label: "変更履歴", count: systemActivityEvents.length },
                  { id: "all" as const, label: "すべて", count: events.length },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActivityFilter(filter.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      activityFilter === filter.id
                        ? "bg-[#eef3ea] text-[#11150f]"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
                  <Activity className="mx-auto size-7 text-white/30" />
                  <h2 className="mt-3 text-base font-semibold">まだ活動履歴はありません</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">AI取込候補から「単独履歴として反映」すると、ここに時系列で表示されます。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleActivityEvents.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center text-sm text-white/45">
                      この分類の履歴はまだありません。
                    </div>
                  )}
                  {visibleActivityEvents.map((event) => {
                    const linkedWork = work.find((item) => item.id === event.workItemId)
                    const linkedCase = salesCases.find((item) => item.id === event.salesCaseId)
                    const linkedCustomer = customers.find((item) => item.id === (linkedCase?.customerId || linkedWork?.customerId))
                    const date = event.eventDate ? new Date(event.eventDate) : null
                    const dateLabel = date && !Number.isNaN(date.getTime())
                      ? date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                      : event.eventDate || "日時不明"
                    return (
                      <article
                        key={event.id}
                        className={`rounded-2xl border p-4 md:p-5 ${
                          isSystemEvent(event)
                            ? "border-white/[0.07] bg-white/[0.025]"
                            : "border-white/10 bg-[#111311]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.1em] text-white/35">
                              <span>{dateLabel}</span>
                              {event.channel && <Tag>{event.channel}</Tag>}
                              {event.direction && <Tag>{event.direction}</Tag>}
                              <Tag>{SALES_EVENT_LABELS[event.eventType] || event.eventType}</Tag>
                            {salesEventMedia(event) && <Tag>{salesEventMedia(event)}</Tag>}
                            </div>
                            <h2 className="mt-3 text-base font-semibold">{event.counterpartyName || linkedCustomer?.name || "相手先未設定"}</h2>
                            {event.counterpartyEmail && <p className="mt-1 text-xs text-white/35">{event.counterpartyEmail}</p>}
                            {event.note && <p className="mt-3 text-sm leading-6 text-white/60">{displayActivityNote(event.note, SALES_STAGE_LABELS)}</p>}
                          </div>
                          <div className="shrink-0 space-y-2 text-xs text-white/35 md:max-w-64">
                            <div>{linkedCase ? "案件: " + (linkedCase.title || linkedCase.theme) : "案件なし"}</div>
                            <div>{linkedWork ? "業務: " + linkedWork.id : "単独履歴"}</div>
                            {!isSystemEvent(event) && (
                              <button type="button" disabled={!eventSalesLinksConfigured} title={!eventSalesLinksConfigured ? "紐づけ機能の準備が完了していません" : undefined}
                                className="rounded-lg border border-white/15 px-3 py-2 text-white/70 hover:bg-white/5 disabled:opacity-40"
                                onClick={() => { setEditingEventLink(event); setEventLinkCaseId(event.salesCaseId || ""); setEventLinkError("") }}>
                                案件の紐づけを変更
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
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
                  data-operation-sound="click"
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
                  data-operation-sound="click"
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

        {tab === "shipping" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              <Kpi label="登録件数" value={shippingRates.length} />
              <Kpi label="概算" value={shippingRates.filter((r) => r.rateStage === "estimate").length} />
              <Kpi label="提示済み" value={shippingRates.filter((r) => r.rateStage === "quoted").length} />
              <Kpi label="実績" value={shippingRates.filter((r) => r.rateStage === "actual").length} />
            </div>

            <div className="space-y-3">
              {shippingRates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center text-sm text-white/45">
                  送料マスタはまだ空です。AI取込候補から送料を正式反映するとここに表示されます。
                </div>
              ) : (
                shippingRates.map((rate) => {
                  const customer = customers.find((row) => row.id === rate.customerId)
                  const stageLabel = rate.rateStage === "actual" ? "実績" : rate.rateStage === "quoted" ? "提示済み" : "概算"
                  const weightText = rate.actualWeightKg
                    ? `実重量 ${rate.actualWeightKg}kg`
                    : rate.weightFromKg && rate.weightToKg && rate.weightFromKg !== rate.weightToKg
                      ? `${rate.weightFromKg}〜${rate.weightToKg}kg`
                      : rate.weightFromKg
                        ? `${rate.weightFromKg}kg`
                        : ""
                  return (
                    <article key={rate.id} className="rounded-2xl border border-white/10 bg-[#111311] p-4 md:p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-white/35">
                            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">{stageLabel}</span>
                            {rate.carrier && <span>{rate.carrier}</span>}
                            {rate.service && <span>{rate.service}</span>}
                          </div>
                          <h2 className="mt-3 text-lg font-semibold">
                            {rate.origin || "Japan"} → {rate.destination}
                          </h2>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                            {weightText && <Tag>{weightText}</Tag>}
                            {customer && <Tag>{customer.id} {customer.name}</Tag>}
                            {rate.shipmentDate && <Tag>発送 {rate.shipmentDate}</Tag>}
                          </div>
                          {rate.note && <p className="mt-3 text-sm leading-6 text-white/50">{rate.note}</p>}
                        </div>

                        <div className="shrink-0 text-left md:text-right">
                          <div className="text-2xl font-semibold">
                            {rate.price ? Number(rate.price).toLocaleString("ja-JP") : "-"}
                            <span className="ml-1 text-sm font-medium text-white/50">{rate.currency}</span>
                          </div>
                          {rate.transitTime && <div className="mt-1 text-xs text-white/40">{rate.transitTime}</div>}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        )}

        {tab === "ai" && (
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              {aiLoadError && (
                <div role="alert" className="mb-4 rounded-2xl border border-red-300/20 bg-red-300/5 p-5">
                  <p className="text-sm leading-6 text-red-100">{aiLoadError}</p>
                  <button type="button" onClick={() => setAiLoadAttempt((current) => current + 1)} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm">再読み込み</button>
                </div>
              )}
              {aiLoading && <p role="status" className="p-8 text-center text-sm text-white/45">AI取込候補を読み込み中...</p>}
              {aiReviewError && <p role="alert" className="mb-4 rounded-xl border border-red-300/20 p-4 text-sm text-red-100">{aiReviewError}</p>}
              <fieldset hidden={aiLoading || Boolean(aiLoadError)} disabled={aiImportBusy || aiReviewBusy} className="min-w-0">
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">テスト取込</h2>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Claude / ChatGPTが出した共通JSONをここに貼ります。正式DBにはまだ反映せず、AI取込候補にだけ追加します。
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={aiImportBusy || !aiImportJson.trim()}
                    onClick={() => importAiJson()}
                    className="rounded-full bg-[#eef3ea] px-4 py-2 text-xs font-semibold text-[#11150f] disabled:opacity-40"
                  >
                    {aiImportBusy ? "確認中..." : "候補として取込"}
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={aiImportJson}
                  onChange={(e) => setAiImportJson(e.target.value)}
                  className={`${inputClass} mt-3 min-h-52 resize-y py-3 font-mono text-xs`}
                  placeholder='{"source":"claude","session_title":"...","summary":"...","candidates":[...]}'
                />
                {aiImportMessage && (
                  <p className="mt-2 text-xs leading-5 text-white/55">{aiImportMessage}</p>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="未確認" value={pendingAiCount} />
                <Kpi label="承認" value={aiCandidates.filter((item) => item.status === "approved").length} />
                <Kpi label="要修正" value={aiCandidates.filter((item) => item.status === "needs_edit").length} />
                <Kpi label="取込バッチ" value={aiBatches.length} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <select
                  value={aiStatusFilter}
                  onChange={(e) => setAiStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-[#111311] px-3 text-xs text-white outline-none"
                >
                  <option value="pending">未確認のみ</option>
                  <option value="approved">承認済み</option>
                  <option value="needs_edit">要修正</option>
                  <option value="rejected">却下</option>
                  <option value="all">全ステータス</option>
                </select>
                <select
                  value={aiTypeFilter}
                  onChange={(e) => setAiTypeFilter(e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-[#111311] px-3 text-xs text-white outline-none"
                >
                  <option value="all">全種類</option>
                  <option value="work_event">活動履歴</option>
                  <option value="new_sales_case">新規案件BOX</option>
                  <option value="sales_case_update">案件BOX更新</option>
                  <option value="new_work">新規業務</option>
                  <option value="work_update">業務更新</option>
                  <option value="customer_update">取引先更新</option>
                  <option value="product_update">商品更新</option>
                  <option value="price_candidate">価格候補</option>
                  <option value="decision">要判断</option>
                </select>
                <div className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-white/45">
                  表示 {visibleAiCandidates.length}件 / 全{aiCandidates.length}件
                </div>
              </div>

              {false && supplierCostGroups.length > 0 && (
                <div className="mb-4 space-y-3">
                  {supplierCostGroups.map(({ key, candidates }) => {
                    const total = candidates.reduce((sum, candidate) => {
                      const draft = aiPriceDraft[candidate.id] || {}
                      const raw = draft.amount || String(candidate.payload?.amount || candidate.payload?.price || candidate.payload?.cost || "")
                      const value = Number(String(raw).replace(/[,\\s¥￥]/g, ""))
                      return Number.isFinite(value) ? sum + value : sum
                    }, 0)
                    return (
                      <section key={key} className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-100/50">原価一括確認</div>
                            <h2 className="mt-1 text-base font-semibold">{key}</h2>
                            <p className="mt-1 text-xs text-white/45">{candidates.length}件を同一商品の原価内訳としてまとめて確認できます。</p>
                          </div>
                          <div className="text-left md:text-right">
                            <div className="text-[10px] text-white/35">入力中の単純合計</div>
                            <div className="mt-1 text-xl font-semibold">{total.toLocaleString("ja-JP")} <span className="text-xs text-white/45">JPY</span></div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          <select
                            value={aiCostGroupProduct[key] || ""}
                            onChange={(e) => setAiCostGroupProduct((current) => ({ ...current, [key]: e.target.value }))}
                            className="h-10 rounded-xl border border-white/10 bg-[#0d0f0d] px-3 text-xs"
                          >
                            <option value="">一括反映する商品を選択</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>{product.id} {product.name}</option>
                            ))}
                          </select>
                          <input
                            value={aiCostGroupVendor[key] ?? (key === "仕入先未設定" ? "" : key)}
                            onChange={(e) => setAiCostGroupVendor((current) => ({ ...current, [key]: e.target.value }))}
                            className="h-10 rounded-xl border border-white/10 bg-[#0d0f0d] px-3 text-xs"
                            placeholder="仕入先・外注先"
                          />
                        </div>

                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                          {candidates.map((candidate, index) => (
                            <div key={candidate.id} className={"grid gap-2 bg-black/10 p-3 md:grid-cols-[1fr_150px_130px_80px] " + (index ? "border-t border-white/10" : "")}>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-medium">{candidate.title || "原価候補"}</div>
                                <div className="mt-1 text-[10px] text-white/35">候補ごとに区分と金額だけ確認</div>
                              </div>
                              <select
                                value={aiPriceDraft[candidate.id]?.cost_type ?? String(candidate.payload?.cost_type || "")}
                                onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), cost_type: e.target.value } }))}
                                className="h-9 rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                              >
                                <option value="">原価区分</option>
                                <option value="base_purchase">基準仕入原価</option>
                                <option value="processing">加工費</option>
                                <option value="packaging">包装費</option>
                                <option value="labeling">ラベル費</option>
                                <option value="inspection">検査費</option>
                                <option value="domestic_freight">国内運賃</option>
                                <option value="other">その他</option>
                              </select>
                              <input
                                value={aiPriceDraft[candidate.id]?.amount ?? String(candidate.payload?.amount || candidate.payload?.price || candidate.payload?.cost || "")}
                                onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), amount: e.target.value } }))}
                                className="h-9 rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                placeholder="金額"
                              />
                              <div className="flex h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-xs text-white/45">
                                {String(candidate.payload?.currency || "JPY")}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={Boolean(aiBulkCostBusy[key])}
                          onClick={() => applySupplierCostGroup(key, candidates).catch((error) => alert(error instanceof Error ? error.message : "原価の一括反映に失敗しました。"))}
                          className="mt-3 w-full rounded-xl bg-[#eef3ea] px-4 py-2.5 text-xs font-semibold text-[#11150f] disabled:opacity-50"
                        >
                          {aiBulkCostBusy[key] ? "反映中..." : candidates.length + "件を原価履歴へ一括反映"}
                        </button>
                      </section>
                    )
                  })}
                </div>
              )}

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
                  {aiEditMessage && <div role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-sm text-emerald-100"><p>{aiEditMessage}</p>{aiCreatedBoxId && <button type="button" disabled={!salesCases.some((item) => item.id === aiCreatedBoxId)} onClick={() => openImportedBox(aiCreatedBoxId)} className="mt-2 rounded-full border border-emerald-300/30 px-3 py-2 text-xs disabled:opacity-40">案件BOXを開く</button>}</div>}
                  {visibleAiCandidates.map((candidate) => {
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
                            {candidate.candidate_type === "price_candidate" && candidate.payload && (
                              <div className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs">
                                <div className="font-semibold text-amber-100">価格候補はまだ正式価格ではありません</div>
                                <div className="mt-1 text-amber-100/55">
                                  まず「何の価格か」を分類します。分類しただけでは価格マスタ・送料マスタには反映されません。
                                </div>
                              </div>
                            )}

                            {candidate.candidate_type === "customer_update" && candidate.payload && (
                              <div className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs md:grid-cols-2">
                                <div><span className="text-white/35">会社名</span><div className="mt-1 text-white/75">{String(candidate.payload.company_name || "未設定")}</div></div>
                                <div><span className="text-white/35">国</span><div className="mt-1 text-white/75">{String(candidate.payload.country || "未設定")}</div></div>
                                <div><span className="text-white/35">担当者</span><div className="mt-1 text-white/75">{String(candidate.payload.contact_name || "未設定")}</div></div>
                                <div><span className="text-white/35">メール</span><div className="mt-1 break-all text-white/75">{String(candidate.payload.email || "未設定")}</div></div>
                                <div><span className="text-white/35">接点区分</span><div className="mt-1 text-white/75">{String(candidate.payload.contact_origin || "未設定")}</div></div>
                                <div><span className="text-white/35">媒体</span><div className="mt-1 text-white/75">{String(candidate.payload.channel || "未設定")}</div></div>
                              </div>
                            )}
                            {candidate.payload && Object.keys(candidate.payload).length > 0 && (
                              <details className="mt-3 rounded-xl border border-white/10 bg-black/20">
                                <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-white/45 hover:text-white/70">
                                  JSON詳細を表示
                                </summary>
                                <pre className="max-h-72 overflow-auto border-t border-white/10 p-3 text-xs leading-5 text-white/55">
                                  {JSON.stringify(candidate.payload, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>

                          <div className="w-full shrink-0 space-y-2 md:w-72">

                            {candidate.candidate_type === "sales_case_update" && <div className="space-y-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-xs">
                              <Field label="更新する既存案件BOX"><select disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} value={caseUpdateTarget(candidate)} onChange={(e) => setAiMatchCase((old) => ({ ...old, [candidate.id]: e.target.value }))} className="h-10 w-full rounded-lg border border-white/15 bg-[#111311] px-2 text-xs"><option value="">案件BOXを選択</option>{salesCases.map((item) => <option key={item.id} value={item.id}>{customers.find((customer) => customer.id === item.customerId)?.name || "取引先未設定"} / {item.title}</option>)}</select></Field>
                              {isAiCandidateApplied(candidate.decision_note) && candidate.target_id ? <button type="button" onClick={() => openImportedBox(candidate.target_id!)} className="rounded-full border border-white/15 px-3 py-2">更新した案件BOXを開く</button> : <>
                                {caseUpdatePreview(candidate).error ? <p role="alert" className="text-amber-100/70">{caseUpdatePreview(candidate).error}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[280px] text-left text-[10px]"><caption className="sr-only">案件BOXの変更前後</caption><thead className="text-white/40"><tr><th className="py-2">項目</th><th className="py-2">変更前</th><th className="py-2">変更後</th></tr></thead><tbody>{caseUpdatePreview(candidate).rows.map((row) => <tr key={row.key} className="border-t border-white/10"><th className="py-2 pr-2 font-medium">{row.label}</th><td className="break-words py-2 pr-2 text-white/50">{row.key === "stage" ? SALES_STAGE_LABELS[row.before as SalesCase["stage"]] || row.before : row.before || "未設定"}</td><td className="break-words py-2 text-emerald-100">{row.key === "stage" ? SALES_STAGE_LABELS[row.after as SalesCase["stage"]] || row.after : row.after || "未設定"}</td></tr>)}</tbody></table></div>}
                                <p className="text-[10px] leading-5 text-white/45">指定した項目だけを更新します。段階が変わる場合は反映時刻から新しい段階の滞在日数を測定します。業務カードや活動内容は別候補です。</p>
                                <button type="button" disabled={aiReviewBusy || Boolean(caseUpdatePreview(candidate).error)} onClick={() => applyAiCaseUpdate(candidate)} className="w-full rounded-full bg-[#eef3ea] px-4 py-2 font-semibold text-[#11150f] disabled:opacity-40">案件BOXを更新</button>
                              </>}
                            </div>}
                            {candidate.candidate_type === "new_sales_case" && <div className="space-y-2 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-xs">
                              <div className="font-semibold text-emerald-100">案件BOXの作成内容</div>
                              <select aria-label="案件BOXの取引先" value={boxCandidateDetails(candidate).customerId} onChange={(e) => setAiMatchCustomer((current) => ({ ...current, [candidate.id]: e.target.value }))} className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2"><option value="">取引先を選択</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.id} {item.name}</option>)}</select>
                              <p>テーマ：{boxCandidateDetails(candidate).theme || "未設定"}</p>
                              <p>担当者：{boxCandidateDetails(candidate).assignee || "未設定"}</p>
                              <p>区分：{boxCandidateDetails(candidate).caseType === "existing_followup" ? "既存フォロー" : "新規商談"}</p>
                              <p>状態：{SALES_STAGE_LABELS[boxCandidateDetails(candidate).stage as SalesCase["stage"]] || "不正な状態"} ／温度感：{boxCandidateDetails(candidate).heat}</p>
                              <p>次回フォロー：{String(candidate.payload?.next_follow_up_date || "未設定")}</p>
                              <p>次のアクション：{String(candidate.payload?.next_action || "未設定")}</p>
                              <p className="text-[10px] leading-4 text-white/45">確認後に案件BOXを作成します。業務カード・受注はこの操作では作成しません。</p>
                              {isAiCandidateApplied(candidate.decision_note) && candidate.target_id ? <button type="button" onClick={() => openImportedBox(candidate.target_id!)} className="rounded-full border border-white/15 px-3 py-2">案件BOXを開く</button> : <button type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} onClick={() => applyAiSalesBox(candidate)} className="w-full rounded-full bg-[#eef3ea] px-4 py-2 font-semibold text-[#11150f]">案件BOXを作成</button>}
                            </div>}
                            {candidate.candidate_type === "price_candidate" && (
                              <fieldset disabled={isAiCandidateApplied(candidate.decision_note)}><div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3">
                                <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-amber-100/50">価格の種類</div>
                                <select
                                  value={aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")}
                                  onChange={(e) => setAiPriceClass((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                  className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                >
                                  <option value="">選択してください</option>
                                  <option value="supplier_cost">仕入価格</option>
                                  <option value="standard_wholesale">標準卸価格</option>
                                  <option value="customer_quoted">取引先へ提示済み価格</option>
                                  <option value="customer_planned">提案予定価格</option>
                                  <option value="shipping_rate">送料・運賃</option>
                                  <option value="other">その他 / 要確認</option>
                                </select>
                                {(aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")) === "supplier_cost" && (
                                  <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-black/10 p-2">
                                    <div className="text-[10px] font-semibold tracking-[0.12em] text-amber-100/50">原価履歴への紐付け</div>
                                    <select
                                      value={candidateProducts(candidate)[0] || ""}
                                      onChange={(e) => setAiMatchProducts((current) => ({ ...current, [candidate.id]: e.target.value ? [e.target.value] : [] }))}
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">商品を選択</option>
                                      {products.map((product) => (
                                        <option key={product.id} value={product.id}>{product.id} {product.name}</option>
                                      ))}
                                    </select>
                                    <div className="space-y-2">
                                      {getAiCostRows(candidate).map((row, rowIndex) => (
                                        <div key={row.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-2">
                                          <div className="mb-2 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-white/40">内訳 {rowIndex + 1}</span>
                                            {getAiCostRows(candidate).length > 1 && (
                                              <button type="button" onClick={() => removeAiCostRow(candidate, row.id)} className="text-[10px] text-red-300/70">
                                                削除
                                              </button>
                                            )}
                                          </div>
                                          <select
                                            value={row.cost_type}
                                            onChange={(e) => updateAiCostRow(candidate, row.id, { cost_type: e.target.value })}
                                            className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                          >
                                            <option value="base_purchase">基準仕入原価</option>
                                            <option value="processing">加工費</option>
                                            <option value="packaging">包装費</option>
                                            <option value="labeling">ラベル費</option>
                                            <option value="inspection">検査費</option>
                                            <option value="domestic_freight">国内運賃</option>
                                            <option value="other">その他</option>
                                          </select>
                                          <input
                                            className="mt-2 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                            placeholder="内訳名 例: 根本さん加工費"
                                            value={row.label}
                                            onChange={(e) => updateAiCostRow(candidate, row.id, { label: e.target.value })}
                                          />
                                          <div className="mt-2 grid grid-cols-[1fr_80px] gap-2">
                                            <input
                                              className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                              placeholder="金額"
                                              value={row.amount}
                                              onChange={(e) => updateAiCostRow(candidate, row.id, { amount: e.target.value })}
                                            />
                                            <input
                                              className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                              placeholder="JPY"
                                              value={row.currency}
                                              onChange={(e) => updateAiCostRow(candidate, row.id, { currency: e.target.value })}
                                            />
                                          </div>
                                          <div className="mt-2 grid grid-cols-2 gap-2">
                                            <input
                                              className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                              placeholder="単位 例: kg"
                                              value={row.unit}
                                              onChange={(e) => updateAiCostRow(candidate, row.id, { unit: e.target.value })}
                                            />
                                            <input
                                              type="date"
                                              className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                              value={row.effective_from}
                                              onChange={(e) => updateAiCostRow(candidate, row.id, { effective_from: e.target.value })}
                                            />
                                          </div>
                                          <input
                                            className="mt-2 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                            placeholder="仕入先・外注先"
                                            value={row.supplier_or_vendor}
                                            onChange={(e) => updateAiCostRow(candidate, row.id, { supplier_or_vendor: e.target.value })}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => addAiCostRow(candidate)}
                                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70"
                                    >
                                      ＋ 原価内訳を追加
                                    </button>
                                    <button
                                      type="button"
                                      disabled={Boolean(aiBulkCostBusy[candidate.id]) || isAiCandidateApplied(candidate.decision_note)}
                                      onClick={() => applyAiCostRows(candidate).catch((error) => alert(error instanceof Error ? error.message : "原価履歴への反映に失敗しました。"))}
                                      className="w-full rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-semibold text-[#11150f] disabled:opacity-50"
                                    >
                                      {aiBulkCostBusy[candidate.id] ? "反映中..." : getAiCostRows(candidate).length + "件を原価履歴へ一括反映"}
                                    </button>
                                    <p className="text-[10px] leading-4 text-amber-100/45">
                                      1つの候補から複数の原価内訳をまとめて登録できます。既存履歴は上書きしません。
                                    </p>
                                  </div>
                                )}

                                {(aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")) === "customer_quoted" && (
                                  <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-black/10 p-2">
                                    <div className="text-[10px] font-semibold tracking-[0.12em] text-amber-100/50">提示済み価格の紐付け</div>
                                    <select
                                      value={candidateCustomer(candidate)}
                                      onChange={(e) => setAiMatchCustomer((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">取引先を選択</option>
                                      {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.id} {customer.name}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={candidateProducts(candidate)[0] || ""}
                                      onChange={(e) => setAiMatchProducts((current) => ({ ...current, [candidate.id]: e.target.value ? [e.target.value] : [] }))}
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">商品を選択</option>
                                      {products.map((product) => (
                                        <option key={product.id} value={product.id}>{product.id} {product.name}</option>
                                      ))}
                                    </select>
                                    <div className="grid grid-cols-[1fr_80px] gap-2">
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="価格"
                                        value={aiPriceDraft[candidate.id]?.amount ?? String(candidate.payload?.amount || candidate.payload?.price || "")}
                                        onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), amount: e.target.value } }))}
                                      />
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="JPY"
                                        value={aiPriceDraft[candidate.id]?.currency ?? String(candidate.payload?.currency || "JPY")}
                                        onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), currency: e.target.value } }))}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="単位 例: kg"
                                        value={aiPriceDraft[candidate.id]?.unit ?? String(candidate.payload?.unit || "kg")}
                                        onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), unit: e.target.value } }))}
                                      />
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="MOQ"
                                        value={aiPriceDraft[candidate.id]?.moq ?? String(candidate.payload?.moq || "")}
                                        onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), moq: e.target.value } }))}
                                      />
                                    </div>
                                    <input
                                      type="date"
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                      value={aiPriceDraft[candidate.id]?.effective_from ?? String(candidate.payload?.effective_from || "")}
                                      onChange={(e) => setAiPriceDraft((current) => ({ ...current, [candidate.id]: { ...(current[candidate.id] || {}), effective_from: e.target.value } }))}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => applyAiCandidate(candidate).catch((error) => alert(error instanceof Error ? error.message : "取引先価格への反映に失敗しました。"))}
                                      className="w-full rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-semibold text-[#11150f]"
                                    >
                                      取引先の価格履歴へ正式反映
                                    </button>
                                    <p className="text-[10px] leading-4 text-amber-100/45">
                                      既存価格は上書きせず、新しい価格履歴として追加します。
                                    </p>
                                  </div>
                                )}

                                {(aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")) === "shipping_rate" && (
                                  <div className="mt-3">
                                    <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-amber-100/50">送料の状態</div>
                                    <select
                                      value={aiShippingStage[candidate.id] || String(candidate.payload?.shipping_stage || "")}
                                      onChange={(e) => setAiShippingStage((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">選択してください</option>
                                      <option value="estimate">概算</option>
                                      <option value="quoted">顧客へ提示済み</option>
                                      <option value="actual">実績</option>
                                    </select>
                                    <p className="mt-2 text-[10px] leading-4 text-amber-100/45">
                                      概算＝料金表等の目安、提示済み＝顧客へ案内した金額、実績＝発送後に確定した実費。
                                    </p>

                                    <div className="mt-3 grid gap-2">
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="配送先 例: Singapore"
                                        value={aiShippingDraft[candidate.id]?.destination ?? String(candidate.payload?.destination || candidate.payload?.country || "")}
                                        onChange={(e) => setAiShippingDraft((current) => ({
                                          ...current,
                                          [candidate.id]: { ...(current[candidate.id] || {}), destination: e.target.value },
                                        }))}
                                      />
                                      <div className="grid grid-cols-[1fr_80px] gap-2">
                                        <input
                                          className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                          placeholder="送料金額"
                                          value={aiShippingDraft[candidate.id]?.amount ?? String(candidate.payload?.amount || candidate.payload?.price || candidate.payload?.shipping_cost || "")}
                                          onChange={(e) => setAiShippingDraft((current) => ({
                                            ...current,
                                            [candidate.id]: { ...(current[candidate.id] || {}), amount: e.target.value },
                                          }))}
                                        />
                                        <input
                                          className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                          placeholder="JPY"
                                          value={aiShippingDraft[candidate.id]?.currency ?? String(candidate.payload?.currency || "JPY")}
                                          onChange={(e) => setAiShippingDraft((current) => ({
                                            ...current,
                                            [candidate.id]: { ...(current[candidate.id] || {}), currency: e.target.value },
                                          }))}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                          placeholder="配送会社 例: Japan Post"
                                          value={aiShippingDraft[candidate.id]?.carrier ?? String(candidate.payload?.carrier || "")}
                                          onChange={(e) => setAiShippingDraft((current) => ({
                                            ...current,
                                            [candidate.id]: { ...(current[candidate.id] || {}), carrier: e.target.value },
                                          }))}
                                        />
                                        <input
                                          className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                          placeholder="サービス 例: EMS"
                                          value={aiShippingDraft[candidate.id]?.service ?? String(candidate.payload?.service || candidate.payload?.shipping_method || "")}
                                          onChange={(e) => setAiShippingDraft((current) => ({
                                            ...current,
                                            [candidate.id]: { ...(current[candidate.id] || {}), service: e.target.value },
                                          }))}
                                        />
                                      </div>
                                      <input
                                        className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                        placeholder="想定重量kg 例: 2.0"
                                        value={aiShippingDraft[candidate.id]?.weight_kg ?? String(candidate.payload?.weight_kg || "")}
                                        onChange={(e) => setAiShippingDraft((current) => ({
                                          ...current,
                                          [candidate.id]: { ...(current[candidate.id] || {}), weight_kg: e.target.value },
                                        }))}
                                      />
                                      {(aiShippingStage[candidate.id] || String(candidate.payload?.shipping_stage || "")) === "actual" && (
                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            type="date"
                                            className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                            value={aiShippingDraft[candidate.id]?.shipment_date ?? String(candidate.payload?.shipment_date || "")}
                                            onChange={(e) => setAiShippingDraft((current) => ({
                                              ...current,
                                              [candidate.id]: { ...(current[candidate.id] || {}), shipment_date: e.target.value },
                                            }))}
                                          />
                                          <input
                                            className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                            placeholder="実重量kg"
                                            value={aiShippingDraft[candidate.id]?.actual_weight_kg ?? String(candidate.payload?.actual_weight_kg || "")}
                                            onChange={(e) => setAiShippingDraft((current) => ({
                                              ...current,
                                              [candidate.id]: { ...(current[candidate.id] || {}), actual_weight_kg: e.target.value },
                                            }))}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => savePriceClassification(candidate).catch((error) => alert(error instanceof Error ? error.message : "価格分類を保存できませんでした。"))}
                                  className="mt-2 w-full rounded-lg border border-amber-200/20 px-3 py-2 text-xs font-medium text-amber-100"
                                >
                                  分類だけ保存
                                </button>
                                {Boolean(candidate.payload?.price_classification) && (
                                  <p className="mt-2 text-[10px] leading-4 text-amber-100/50">
                                    保存済み: {String(candidate.payload?.price_classification || "")}
                                    {candidate.payload?.shipping_stage ? ` / ${String(candidate.payload.shipping_stage)}` : ""}
                                  </p>
                                )}
                                {(aiPriceClass[candidate.id] || String(candidate.payload?.price_classification || "")) === "shipping_rate" &&
                                  Boolean(aiShippingStage[candidate.id] || candidate.payload?.shipping_stage) && (
                                  <button
                                    type="button"
                                    onClick={() => applyAiCandidate(candidate).catch((error) => alert(error instanceof Error ? error.message : "送料マスタへの反映に失敗しました。"))}
                                    className="mt-2 w-full rounded-lg bg-[#eef3ea] px-3 py-2 text-xs font-semibold text-[#11150f]"
                                  >
                                    送料マスタへ正式反映
                                  </button>
                                )}
                              </div></fieldset>
                            )}

                            {(candidate.candidate_type === "new_work" || candidate.candidate_type === "work_update" || candidate.candidate_type === "work_event" || candidate.candidate_type === "customer_update" || candidate.candidate_type === "product_update") && (
                              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                                <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-white/35">紐付け確認</div>

                                {candidate.candidate_type === "new_work" && (
                                  <div className="space-y-2">
                                    <select
                                      aria-label="新規業務カードの取引先"
                                      value={candidateCustomer(candidate)}
                                      onChange={(e) => setAiMatchCustomer((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                      className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">取引先なし / 未確定</option>
                                      {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.id} {customer.name}</option>
                                      ))}
                                    </select>
                                    <p>担当者：{String(candidate.payload?.assignee || auth.user?.displayName || auth.user?.email || "未設定")}</p>
                                    <Field label="作成する列（状態）">
                                      <select value={newWorkCandidateStatus(candidate)} onChange={(e) => setAiNewWorkStatus((current) => ({ ...current, [candidate.id]: e.target.value as Status }))} className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs">
                                        {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                                      </select>
                                    </Field>
                                    <p className="text-[10px] leading-4 text-white/45">業務管理の「{STATUSES.find((status) => status.id === newWorkCandidateStatus(candidate))?.label}」列に新しいカードを作成します。状態の変更は正式反映時に保存されます。</p>
                                  </div>
                                )}

                                {candidate.candidate_type === "customer_update" && (
                                  <>
                                    <select
                                      value={candidateCustomer(candidate)}
                                      onChange={(e) => setAiMatchCustomer((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                      className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">新規取引先として登録</option>
                                      {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>既存に反映: {customer.id} {customer.name}</option>
                                      ))}
                                    </select>
                                    <p className="text-[10px] leading-4 text-white/35">
                                      既存取引先なら選択。未選択なら新しいC番号を発行します。価格情報はここでは反映しません。
                                    </p>
                                  </>
                                )}

                                {candidate.candidate_type === "product_update" && (
                                  <>
                                    <select
                                      value={candidateProducts(candidate)[0] || ""}
                                      onChange={(e) => setAiMatchProducts((current) => ({ ...current, [candidate.id]: e.target.value ? [e.target.value] : [] }))}
                                      className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">新規商品として登録</option>
                                      {products.map((product) => (
                                        <option key={product.id} value={product.id}>既存に反映: {product.id} {product.name}</option>
                                      ))}
                                    </select>
                                    <p className="text-[10px] leading-4 text-white/35">
                                      既存商品なら選択。未選択なら新しいM番号を発行します。原価・標準卸価格はここでは変更しません。
                                    </p>
                                  </>
                                )}

                                {candidate.candidate_type === "work_update" && !isAiCandidateApplied(candidate.decision_note) && (
                                  <div className="space-y-3">
                                    <select aria-label="更新する既存業務" value={workUpdateTarget(candidate)} onChange={(e) => setAiMatchWork((current) => ({ ...current, [candidate.id]: e.target.value }))} className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs">
                                      <option value="">更新する既存業務を選択</option>
                                      {work.map((item) => <option key={item.id} value={item.id}>{item.id} {item.title}</option>)}
                                    </select>
                                    <p className="text-[10px] leading-4 text-white/45">チェックした項目だけ更新します。取引先・案件・商品・履歴・添付はそのまま残ります。</p>
                                    {workUpdatePreview(candidate).error ? <p className="text-xs leading-5 text-amber-100">{workUpdatePreview(candidate).error}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-[10px]"><thead><tr className="text-white/40"><th className="pb-2">項目</th><th className="pb-2">変更前</th><th className="pb-2">変更後</th></tr></thead><tbody>{workUpdatePreview(candidate).rows.map((row) => <tr key={row.key} className="border-t border-white/10"><td className="py-2 pr-2">{row.label}</td><td className="break-all py-2 pr-2 text-white/45">{row.key === "status" ? STATUSES.find((s) => s.id === row.before)?.label || row.before : row.before || "未設定"}</td><td className="break-all py-2 text-emerald-100">{row.key === "status" ? STATUSES.find((s) => s.id === row.after)?.label || row.after : row.after || "未設定にする"}</td></tr>)}</tbody></table></div>}
                                  </div>
                                )}

                                {candidate.candidate_type === "work_event" && (
                                  <>
                                    <select
                                      aria-label="活動履歴の紐づけ先"
                                      value={aiEventTarget[candidate.id] || ""}
                                      onChange={(e) => setAiEventTarget((current) => ({ ...current, [candidate.id]: e.target.value }))}
                                      className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-[#0d0f0d] px-2 text-xs"
                                    >
                                      <option value="">単独の活動履歴として保存</option>
                                      <optgroup label="案件へ紐づけ">
                                        {salesCases.map((item) => <option key={item.id} value={`sales:${item.id}`}>案件：{customers.find((customer) => customer.id === item.customerId)?.name || "取引先未設定"} / {item.title}</option>)}
                                      </optgroup>
                                      <optgroup label="業務管理の業務へ紐づけ">
                                        {work.map((item) => <option key={item.id} value={`work:${item.id}`}>業務：{item.id} {item.title}</option>)}
                                      </optgroup>
                                    </select>
                                    <p className="text-[10px] leading-4 text-white/35">
                                      提案・メール送信・返答などの商談履歴は案件へ紐づけます。W番号は業務管理の別の業務です。未選択なら単独履歴として保存します。
                                    </p>
                                  </>
                                )}

                                {candidate.candidate_type === "new_work" && products.length > 0 && (
                                  <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
                                    {products.map((product) => {
                                      const active = candidateProducts(candidate).includes(product.id)
                                      return (
                                        <button
                                          key={product.id}
                                          type="button"
                                          onClick={() => toggleAiProduct(candidate.id, product.id)}
                                          className={`rounded-md border px-2 py-1 text-[10px] ${active ? "border-[#66845c] bg-[#66845c]/20 text-[#d6e5d1]" : "border-white/10 text-white/45"}`}
                                        >
                                          {product.id}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {candidate.candidate_type === "work_update" && !isAiCandidateApplied(candidate.decision_note) && <button type="button" disabled={aiReviewBusy || Boolean(workUpdatePreview(candidate).error)} onClick={() => applyAiWorkUpdate(candidate)} className="rounded-full bg-[#eef3ea] px-4 py-2 text-xs font-semibold text-[#11150f] disabled:opacity-40">変更を反映</button>}
                              {!isAiCandidateApplied(candidate.decision_note) && <button type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} onClick={() => openAiCandidateEditor(candidate)} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80">候補を編集</button>}
                              {(candidate.candidate_type === "new_work" || candidate.candidate_type === "work_event" || candidate.candidate_type === "customer_update" || candidate.candidate_type === "product_update") && (
                                <button
                                  type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)}
                                  onClick={() => applyAiCandidate(candidate).catch((error) => alert(error instanceof Error ? error.message : "正式反映に失敗しました。"))}
                                  className="rounded-full bg-[#eef3ea] px-4 py-2 text-xs font-semibold text-[#11150f]"
                                >
                                  {candidate.candidate_type === "work_event" && !aiEventTarget[candidate.id]
                                    ? "単独履歴として反映"
                                    : candidate.candidate_type === "work_event" && (aiEventTarget[candidate.id] || "").startsWith("sales:")
                                      ? "案件へ履歴を反映"
                                      : candidate.candidate_type === "customer_update" && !candidateCustomer(candidate)
                                      ? "新規取引先として反映"
                                      : candidate.candidate_type === "product_update" && !candidateProducts(candidate).length
                                        ? "新規商品として反映"
                                        : candidate.candidate_type === "new_work"
                                          ? "業務カードを作成"
                                          : "正式反映"}
                                </button>
                              )}
                              <button
                                type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} onClick={() => reviewAiCandidate(candidate.id, "approved")}
                                className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/65"
                              >
                                候補だけ承認
                              </button>
                              <button
                                type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} onClick={() => reviewAiCandidate(candidate.id, "needs_edit")}
                                className="rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs text-amber-100"
                              >
                                要修正
                              </button>
                              <button
                                type="button" disabled={aiReviewBusy || isAiCandidateApplied(candidate.decision_note)} onClick={() => reviewAiCandidate(candidate.id, "rejected")}
                                className="rounded-full border border-red-300/15 px-4 py-2 text-xs text-red-300"
                              >
                                却下
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-xs text-white/55">
                          {String(candidate.decision_note || "").startsWith("正式反映処理中:") ? "反映処理中／保存結果の確認が必要" : isAiCandidateApplied(candidate.decision_note) ? "正式反映済み" : candidate.status === "approved" ? (candidate.decision_note === "候補だけ承認（正式反映なし）" ? "候補のみ承認（正式反映なし）" : "確認済み（反映記録なし・反映先を確認）") : "現在の判定: " + (candidate.status === "rejected" ? "却下" : candidate.status === "needs_edit" ? "要修正" : "未判定")}
                          {candidate.decision_note && <p className="mt-1 break-all">{candidate.decision_note}</p>}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
              </fieldset>
            </div>
          </section>
        )}
      </div>

      {editingEventLink && (
        <Modal onClose={() => { if (!eventLinkBusy) setEditingEventLink(null) }}>
          <ModalTitle eyebrow="活動履歴" title="案件の紐づけ" onClose={() => { if (!eventLinkBusy) setEditingEventLink(null) }} />
          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-sm font-semibold">{editingEventLink.counterpartyName || "相手先未設定"}</p>
              {editingEventLink.counterpartyEmail && <p className="mt-1 text-xs text-white/45">{editingEventLink.counterpartyEmail}</p>}
              <p className="mt-2 text-xs leading-5 text-white/60">{editingEventLink.note}</p>
            </div>
            <Field label="紐づけ先の案件">
              <select className={inputClass} value={eventLinkCaseId} disabled={eventLinkBusy} onChange={(event) => setEventLinkCaseId(event.target.value)}>
                <option value="">紐づけなし</option>
                {salesCases.filter((item) => {
                  const linkedCustomerId = work.find((task) => task.id === editingEventLink.workItemId)?.customerId
                  return !linkedCustomerId || linkedCustomerId === item.customerId
                }).map((item) => <option key={item.id} value={item.id}>{customers.find((customer) => customer.id === item.customerId)?.name || item.customerId} / {item.title || item.theme} / {item.id.slice(0, 8)}</option>)}
              </select>
            </Field>
            <p className="text-xs leading-5 text-white/45">保存すると、この履歴が選択した案件とKPIに反映されます。履歴の日時・本文・出典はそのまま残ります。「紐づけなし」で解除できます。</p>
            {eventLinkError && <p role="alert" className="text-sm text-red-300">{eventLinkError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={eventLinkBusy} className="rounded-xl border border-white/15 px-4 py-2 text-sm" onClick={() => setEditingEventLink(null)}>キャンセル</button>
              <button type="button" disabled={eventLinkBusy || !eventSalesLinksConfigured} className="rounded-xl bg-[#eef3ea] px-4 py-2 text-sm font-semibold text-[#11150f] disabled:opacity-40" onClick={saveEventLink}>{eventLinkBusy ? "保存中..." : "紐づけを保存"}</button>
            </div>
          </div>
        </Modal>
      )}

      {editingOrder && (
        <Modal onClose={() => { if (!(mutationBusy)) setEditingOrder(null) }} wide>
          <form onSubmit={saveOrder}>
            <fieldset disabled={mutationBusy} className="min-w-0">
            <ModalTitle eyebrow="受注履歴" title={editingOrder.id ? "受注を編集" : "新しい受注"} onClose={() => { if (!(mutationBusy)) setEditingOrder(null) }} />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="取引先">
                <select
                  required
                  autoFocus
                  className={inputClass}
                  value={editingOrder.customerId}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerId: e.target.value, salesCaseId: "" })}
                >
                  <option value="">選択してください</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.id} {customer.name}</option>)}
                </select>
              </Field>

              <Field label="関連案件">
                <select
                  className={inputClass}
                  value={editingOrder.salesCaseId || ""}
                  onChange={(e) => {
                    const box = salesCases.find(item => item.id === e.target.value)
                    setEditingOrder({ ...editingOrder, salesCaseId: e.target.value, ...(!editingOrder.id && box ? { orderType: box.caseType === "new_business" ? "first" as const : "repeat" as const } : {}) })
                  }}
                >
                  <option value="">紐づけなし</option>
                  {salesCases
                    .filter((item) => !editingOrder.customerId || item.customerId === editingOrder.customerId)
                    .map((item) => <option key={item.id} value={item.id}>{item.theme || item.title}</option>)}
                </select>
              </Field>

              <Field label="受注種別">
                <select className={inputClass} value={editingOrder.orderType} onChange={(e) => setEditingOrder({ ...editingOrder, orderType: e.target.value as Order["orderType"] })}>
                  <option value="first">初回発注</option>
                  <option value="repeat">リピート</option>
                </select>
              </Field>

              <Field label="受注日">
                <input required type="date" className={inputClass} value={editingOrder.orderDate} onChange={(e) => setEditingOrder({ ...editingOrder, orderDate: e.target.value })} />
              </Field>

              <Field label="通貨">
                <select className={inputClass} value={editingOrder.currency} onChange={(e) => setEditingOrder({ ...editingOrder, currency: e.target.value })}>
                  <option value="JPY">JPY</option>
                  <option value="SGD">SGD</option>
                  <option value="USD">USD</option>
                  <option value="BHD">BHD</option>
                </select>
              </Field>

              <Field label="送料">
                <input inputMode="decimal" className={inputClass} placeholder="例：2800" value={editingOrder.shippingAmount || ""} onChange={(e) => setEditingOrder({ ...editingOrder, shippingAmount: e.target.value })} />
              </Field>
            </div>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">受注明細</h3>
                  <p className="mt-1 text-xs text-white/40">商品ごとの数量と受注単価。受注総額は自動計算。</p>
                </div>
                <button
                  type="button"
                  data-operation-sound="click"
                  onClick={() => setEditingOrder({
                    ...editingOrder,
                    items: [...editingOrder.items, { id: uid(), productId: "", quantity: "", unit: "kg", unitPrice: "", lineAmount: "" }],
                  })}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/5"
                >
                  ＋ 商品を追加
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {editingOrder.items.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-xl bg-white/[0.035] p-3 md:grid-cols-[1.5fr_.7fr_.6fr_.8fr_auto]">
                    <select
                      required
                      className={inputClass}
                      value={item.productId}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        items: editingOrder.items.map((row) => row.id === item.id ? { ...row, productId: e.target.value } : row),
                      })}
                    >
                      <option value="">商品を選択</option>
                      {products.map((product) => <option key={product.id} value={product.id}>{product.id} {product.name}</option>)}
                    </select>
                    <input required inputMode="decimal" className={inputClass} placeholder="数量" value={item.quantity} onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      items: editingOrder.items.map((row) => row.id === item.id ? { ...row, quantity: e.target.value } : row),
                    })} />
                    <select className={inputClass} value={item.unit} onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      items: editingOrder.items.map((row) => row.id === item.id ? { ...row, unit: e.target.value } : row),
                    })}>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="pc">個</option>
                    </select>
                    <input required inputMode="decimal" className={inputClass} placeholder="単価" value={item.unitPrice} onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      items: editingOrder.items.map((row) => row.id === item.id ? { ...row, unitPrice: e.target.value } : row),
                    })} />
                    <button
                      type="button"
                      disabled={editingOrder.items.length === 1}
                      data-operation-sound="click"
                      onClick={() => setEditingOrder({ ...editingOrder, items: editingOrder.items.filter((row) => row.id !== item.id) })}
                      className="rounded-xl border border-white/10 px-3 text-xs text-white/45 disabled:opacity-20"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="注文番号・参照番号">
                <input className={inputClass} value={editingOrder.externalOrderRef || ""} onChange={(e) => setEditingOrder({ ...editingOrder, externalOrderRef: e.target.value })} />
              </Field>
              <Field label="メモ">
                <input className={inputClass} value={editingOrder.note || ""} onChange={(e) => setEditingOrder({ ...editingOrder, note: e.target.value })} />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (mutationBusy) return
                  setEditingOrder(null)
                  if (postOrderFollowupSource) {
                    const source = postOrderFollowupSource
                    setPostOrderFollowupSource(null)
                    setEditingSalesCase(followupFromWon(source))
                  }
                }}
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5"
              >
                キャンセル
              </button>
              <button type="submit" disabled={mutationBusy} className="disabled:opacity-40 rounded-full bg-[#eef3ea] px-5 py-2.5 text-sm font-semibold text-[#11150f] hover:bg-white">
                {mutationBusy ? "保存中..." : "受注を保存"}
              </button>
            </div>
          </fieldset>
          </form>
        </Modal>
      )}

      {wonFollowupSource && (
        <Modal onClose={() => setWonFollowupSource(null)}>
          <div className="p-1">
            <ModalTitle
              eyebrow="成約"
              title="成約後の処理"
              onClose={() => setWonFollowupSource(null)}
            />
            <p className="text-sm leading-6 text-white/55">
              本発注が確定しました。実績として初回受注を残し、次回注文を追う既存顧客フォロー案件も作れます。
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <input
                  type="checkbox"
                  checked={wonCreateOrder}
                  onChange={(e) => setWonCreateOrder(e.target.checked)}
                  className="mt-1 size-4"
                />
                <div>
                  <div className="text-sm font-semibold">
                    {wonFollowupSource.caseType === "new_business" ? "初回受注を登録する" : "リピート受注を登録する"}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-white/45">
                    商品・数量・単価・送料・受注金額を実績として残します。
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <input
                  type="checkbox"
                  checked={wonCreateFollowup}
                  onChange={(e) => setWonCreateFollowup(e.target.checked)}
                  className="mt-1 size-4"
                />
                <div>
                  <div className="text-sm font-semibold">既存顧客フォロー案件を作る</div>
                  <div className="mt-1 text-xs leading-5 text-white/45">
                    次回注文時期の確認や追加提案など、成約後の営業活動を追います。
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-4 text-xs text-white/35">
              初期値は両方ONです。必要な方だけ残して進められます。
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWonFollowupSource(null)}
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5"
              >
                今回は何もしない
              </button>
              <button
                type="button"
                autoFocus
                disabled={!wonCreateOrder && !wonCreateFollowup}
                onClick={() => {
                  const source = wonFollowupSource
                  setWonFollowupSource(null)

                  if (wonCreateOrder) {
                    setEditingOrder(firstOrderFromWon(source))
                    setPostOrderFollowupSource(wonCreateFollowup ? source : null)
                    return
                  }

                  if (wonCreateFollowup) {
                    setEditingSalesCase(followupFromWon(source))
                  }
                }}
                className="rounded-full bg-[#eef3ea] px-4 py-2.5 text-sm font-semibold text-[#11150f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                続ける
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingSalesCase && (
        <Modal onClose={() => { if (!(mutationBusy || salesEventBusy)) setEditingSalesCase(null) }} wide>
          <form onSubmit={saveSalesCase}>
            <fieldset disabled={mutationBusy || salesEventBusy} className="min-w-0">
            <ModalTitle eyebrow="案件" title={editingSalesCase.title || "新しい案件"} onClose={() => { if (!(mutationBusy || salesEventBusy)) setEditingSalesCase(null) }} />
            {persistedEditingCase && editingCaseDuration && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-white/60">
                保存済みの段階：{SALES_STAGE_LABELS[persistedEditingCase.stage]} ／ 滞在：{editingCaseDuration.days === null ? "開始日不明" : Math.round(editingCaseDuration.days * 10) / 10 + "日"}
                <div className="mt-1 text-[10px] text-white/40">{editingCaseDuration.enteredAt ? "開始：" + new Date(editingCaseDuration.enteredAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "過去の開始日は推測しません。次の段階変更から記録します。"} 段階を変更して保存すると、新しい段階の測定が始まります。</div>
                {editingCaseDuration.days === null && <button type="button" onClick={() => repairCaseStage(persistedEditingCase.id)} className="mt-2 rounded-full border border-white/20 px-3 py-1">未確定の段階記録を確認・修復</button>}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="取引先">
                <select
                  required
                  autoFocus
                  className={inputClass}
                  value={editingSalesCase.customerId}
                  onChange={(e) => setEditingSalesCase({ ...editingSalesCase, customerId: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.id} {customer.name}</option>)}
                </select>
              </Field>

              <Field label="接点区分">
                <select disabled={!salesAttributionConfigured} className={inputClass + " disabled:opacity-40"} value={editingSalesCase.originType || ""} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, originType: e.target.value as SalesCase["originType"] })}>
                  <option value="">未設定</option>
                  {ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
                </select>
              </Field>
              <Field label="媒体">
                <select disabled={!salesAttributionConfigured} className={inputClass + " disabled:opacity-40"} value={editingSalesCase.channel || ""} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, channel: e.target.value })}>
                  <option value="">未設定</option>
                  {CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                </select>
              </Field>
              <p className="md:col-span-2 text-xs leading-5 text-white/45">
                {salesAttributionConfigured ? "案件が生まれた接点区分と媒体を登録してください。不明な場合は未設定のままにします。" : "接点区分・媒体の入力はDB更新後に利用できます。現在の項目はそのまま保存できます。"}
              </p>

              <Field label="案件種別">
                <select className={inputClass} value={editingSalesCase.caseType} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, caseType: e.target.value as SalesCase["caseType"] })}>
                  <option value="new_business">新規営業</option>
                  <option value="existing_followup">既存顧客フォロー</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field label="提案テーマ">
                  <input required className={inputClass} placeholder="例：業務用ラテ向け抹茶提案" value={editingSalesCase.theme} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, theme: e.target.value })} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="案件名（空欄なら取引先＋提案テーマで自動生成）">
                  <input className={inputClass} value={editingSalesCase.title} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, title: e.target.value })} />
                </Field>
              </div>

              <Field label="営業ステージ">
                <select className={inputClass} value={editingSalesCase.stage} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, stage: e.target.value as SalesCase["stage"] })}>
                  {Object.entries(SALES_STAGE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>

              <Field label="温度感">
                <select className={inputClass} value={editingSalesCase.heat} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, heat: e.target.value as SalesCase["heat"] })}>
                  <option value="A">A - かなり熱い</option>
                  <option value="B">B - 可能性あり</option>
                  <option value="C">C - 薄い</option>
                </select>
              </Field>

              <Field label="担当">
                <input required className={inputClass} value={editingSalesCase.assignee} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, assignee: e.target.value })} />
              </Field>

              <Field label="次回フォロー日">
                <input type="date" className={inputClass} value={editingSalesCase.nextFollowUpDate || ""} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, nextFollowUpDate: e.target.value })} />
              </Field>

              <div className="md:col-span-2">
                <Field label="次アクション">
                  <input className={inputClass} value={editingSalesCase.nextAction || ""} onChange={(e) => setEditingSalesCase({ ...editingSalesCase, nextAction: e.target.value })} />
                </Field>
              </div>
            </div>

            <ProductPicker
              products={products}
              selected={editingSalesCase.productIds || []}
              onToggle={(id) => setEditingSalesCase({
                ...editingSalesCase,
                productIds: (editingSalesCase.productIds || []).includes(id)
                  ? (editingSalesCase.productIds || []).filter((value) => value !== id)
                  : [...(editingSalesCase.productIds || []), id],
              })}
            />

            {editingSalesCase.id && (
              <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">関連業務</h3>
                    <p className="mt-1 text-xs text-white/40">この案件に紐づく業務カード。</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/50">
                      {work.filter((item) => item.salesCaseId === editingSalesCase.id).length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWork({
                          ...blankWork(),
                          customerId: editingSalesCase.customerId,
                          salesCaseId: editingSalesCase.id,
                          assignee: editingSalesCase.assignee,
                        })
                      }}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/5"
                    >
                      ＋ 業務を追加
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {work.filter((item) => item.salesCaseId === editingSalesCase.id).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/35">
                      まだ関連業務はありません。
                    </div>
                  ) : (
                    work
                      .filter((item) => item.salesCaseId === editingSalesCase.id)
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-operation-sound="click"
                          onClick={() => { if (performance.now() >= suppressClickSoundUntil.current) setEditingWork(item) }}
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f0d] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
                        >
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="mt-1 text-xs text-white/35">
                            {STATUSES.find((row) => row.id === item.status)?.label || item.status}
                            {" · "}
                            {item.assignee || "未担当"}
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </section>
            )}

            {editingSalesCase.id && (
              <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">最近の活動履歴</h3>
                    <p className="mt-1 text-xs text-white/40">この案件に直接紐づく活動。</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/50">
                    {events.filter((event) => event.salesCaseId === editingSalesCase.id).length}
                  </span>
                </div>

                <div className="mt-3">
                  <label className="mb-3 block text-xs text-white/60">
                    今回の連絡媒体
                    <select className={inputClass + " mt-2"} value={salesEventChannel} onChange={(e) => setSalesEventChannel(e.target.value)}>
                      <option value="">選択してください</option>
                      {CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                    </select>
                  </label>
                  <p className="mb-3 text-xs leading-5 text-white/40">電話・展示会も「連絡した／返信・反応あり」で記録できます。Web問い合わせなど相手からの初回連絡は「問い合わせ・初回受信」を使います。案件の起点媒体は変わりません。</p>
                  <input
                    value={salesEventNote}
                    onChange={(e) => setSalesEventNote(e.target.value)}
                    placeholder="活動メモ（空欄でも登録できます）"
                    className={inputClass}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      [salesEventChannel === "Email" ? "email_sent" : "contact_sent", "連絡した"],
                      ["reply_received", "返信・反応あり"],
                      ["contact_received", "問い合わせ・初回受信"],
                      ["quote_sent", "見積提示"],
                      ["sample_sent", "サンプル送付"],
                      ["note", "メモ"],
                    ].map(([eventType, label]) => (
                      <button
                        key={eventType}
                        type="button"
                        disabled={salesEventBusy || (eventType !== "note" && !salesEventChannel)}
                        onClick={async () => {
                          if (mutationLock.current || salesEventBusy || (eventType !== "note" && !salesEventChannel)) return
                          mutationLock.current = true
                          setSalesEventBusy(true)
                          try {
                            await appendSalesCaseEvent(editingSalesCase.id, eventType, salesEventNote, salesEventChannel || undefined)
                            setSalesEventNote("")
                          } catch (error) {
                            console.error(error)
                            alert(error instanceof Error ? error.message : "活動履歴の保存に失敗しました。")
                          } finally {
                            mutationLock.current = false
                            setSalesEventBusy(false)
                          }
                        }}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        ＋ {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {events.filter((event) => event.salesCaseId === editingSalesCase.id).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/35">
                      まだ案件に直接紐づく活動履歴はありません。
                    </div>
                  ) : (
                    events
                      .filter((event) => event.salesCaseId === editingSalesCase.id)
                      .slice(0, 8)
                      .map((event) => (
                        <div key={event.id} className="rounded-xl border border-white/10 bg-[#0d0f0d] p-3">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/35">
                            <span>{event.eventDate ? new Date(event.eventDate).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "日時不明"}</span>
                            <Tag>{SALES_EVENT_LABELS[event.eventType] || event.eventType}</Tag>
                            {salesEventMedia(event) && <Tag>{salesEventMedia(event)}</Tag>}
                          </div>
                          {event.note && <div className="mt-2 text-xs leading-5 text-white/60">{displayActivityNote(event.note, SALES_STAGE_LABELS)}</div>}
                        </div>
                      ))
                  )}
                </div>
              </section>
            )}

            <ModalActions
              busy={mutationBusy || salesEventBusy}
              deleteDisabled={!trashConfigured}
              existing={Boolean(editingSalesCase.id) && ["owner", "admin"].includes(auth.user?.role || "")}
              onDelete={() => { if (editingSalesCase.id) deleteRecord("sales_case", editingSalesCase.id) }}
              onCancel={() => { if (!mutationBusy && !salesEventBusy) setEditingSalesCase(null) }}
            />
          </fieldset>
          </form>
        </Modal>
      )}

      {editingWork && (
        <Modal onClose={() => { if (!(mutationBusy)) setEditingWork(null) }} wide>
          <form onSubmit={saveWork}>
            <fieldset disabled={mutationBusy} className="min-w-0">
            <ModalTitle eyebrow="業務詳細" title={editingWork.title || "新しい業務"} onClose={() => { if (!(mutationBusy)) setEditingWork(null) }} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="件名"><input autoFocus className={inputClass} value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} /></Field>
              <Field label="状態"><select className={inputClass} value={editingWork.status} onChange={(e) => setEditingWork({ ...editingWork, status: e.target.value as Status })}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
              <Field label="取引先"><select className={inputClass} value={editingWork.customerId || ""} onChange={(e) => setEditingWork({ ...editingWork, customerId: e.target.value || undefined, salesCaseId: "" })}><option value="">なし</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.id} {c.name}</option>)}</select></Field>
              <Field label="案件"><select className={inputClass} value={editingWork.salesCaseId || ""} onChange={(e) => setEditingWork({ ...editingWork, salesCaseId: e.target.value || undefined, customerId: e.target.value ? salesCases.find((item) => item.id === e.target.value)?.customerId || editingWork.customerId : editingWork.customerId })}><option value="">なし</option>{salesCases.filter((salesCase) => !editingWork.customerId || salesCase.customerId === editingWork.customerId).map((salesCase) => <option key={salesCase.id} value={salesCase.id}>{salesCase.title || salesCase.theme}</option>)}</select></Field>
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

            {work.some((item) => item.id === editingWork.id) && (
              <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">関連する活動履歴</h3>
                    <p className="mt-1 text-xs text-white/40">この業務カードに紐づく活動を新しい順に表示します。</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/50">
                    {events.filter((event) => event.workItemId === editingWork.id).length}
                  </span>
                </div>
                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                  {events.filter((event) => event.workItemId === editingWork.id).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/35">
                      まだこの業務カードに紐づく活動履歴はありません。
                    </div>
                  ) : (
                    events
                      .filter((event) => event.workItemId === editingWork.id)
                      .sort((a, b) => (Date.parse(b.eventDate) || 0) - (Date.parse(a.eventDate) || 0))
                      .map((event) => {
                        const date = event.eventDate ? new Date(event.eventDate) : null
                        const dateLabel = date && !Number.isNaN(date.getTime())
                          ? date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
                          : event.eventDate || "日時不明"
                        return (
                          <div key={event.id} className="rounded-xl border border-white/10 bg-[#0d0f0d] p-3">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/35">
                              <span>{dateLabel}</span>
                              <Tag>{SALES_EVENT_LABELS[event.eventType] || event.eventType}</Tag>
                              {salesEventMedia(event) && <Tag>{salesEventMedia(event)}</Tag>}
                              {event.counterpartyName && <Tag>{event.counterpartyName}</Tag>}
                            </div>
                            {event.note && <div className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-white/60">{displayActivityNote(event.note, SALES_STAGE_LABELS)}</div>}
                          </div>
                        )
                      })
                  )}
                </div>
              </section>
            )}

            <ModalActions deleteDisabled={!trashConfigured} busy={mutationBusy} existing={work.some((item) => item.id === editingWork.id)} onDelete={() => deleteRecord("work", editingWork.id)} onCancel={() => { if (!(mutationBusy)) setEditingWork(null) }} />
          </fieldset>
          </form>
        </Modal>
      )}

      {editingCustomer && (
        <Modal onClose={() => { if (!(mutationBusy)) setEditingCustomer(null) }} wide>
          <form onSubmit={saveCustomer}>
            <fieldset disabled={mutationBusy} className="min-w-0">
            <ModalTitle eyebrow="取引先マスタ" title={editingCustomer.name || "新しい取引先"} onClose={() => { if (!(mutationBusy)) setEditingCustomer(null) }} />
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

            <section className="mt-4 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold">提示価格・条件の履歴</h3>
              <p className="mt-1 text-xs text-white/45">現在の条件と過去の記録を表示します。提示した価格は受注や支払の確定を意味しません。</p>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {(customers.find(item => item.id === editingCustomer.id)?.priceHistory || []).map(row => <div key={row.id} className="rounded-xl border border-white/10 p-3 text-xs">
                  <p>{row.current ? "現在" : "過去"} ／ {row.productId} {products.find(item => item.id === row.productId)?.name} ／ {row.currency} {row.price}/{row.unit}</p>
                  <p className="mt-1 text-white/45">適用開始：{row.effectiveFrom || "不明"} ／ 記録：{row.createdAt ? new Date(row.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "不明"}</p>
                  {row.note && <p className="mt-1 whitespace-pre-wrap">{row.note}</p>}
                </div>)}
                {!(customers.find(item => item.id === editingCustomer.id)?.priceHistory || []).length && <p className="text-xs text-white/45">価格履歴はありません。</p>}
              </div>
            </section>

            <ModalActions deleteDisabled={!trashConfigured} busy={mutationBusy} existing={customers.some((item) => item.id === editingCustomer.id)} onDelete={() => deleteRecord("customer", editingCustomer.id)} onCancel={() => { if (!(mutationBusy)) setEditingCustomer(null) }} />
          </fieldset>
          </form>
        </Modal>
      )}

      {editingProduct && (
        <Modal onClose={() => { if (!(mutationBusy || productSaveBusy || docUploadBusy)) setEditingProduct(null) }} wide>
          <form onSubmit={saveProduct}>
            <fieldset disabled={mutationBusy || productSaveBusy || docUploadBusy} className="min-w-0">
            <ModalTitle eyebrow="商品マスタ" title={editingProduct.name || "新しい商品"} onClose={() => { if (!(mutationBusy || productSaveBusy || docUploadBusy)) setEditingProduct(null) }} />
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

            {currentProductCostSummary.rows.length > 0 && (
              <section className="mt-6 rounded-2xl border border-[#66845c]/30 bg-[#66845c]/10 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-[#a9c19f]">現在の総原価（参考）</div>
                    <div className="mt-1 text-3xl font-bold">
                      {currentProductCostSummary.total.toLocaleString("ja-JP")}
                      <span className="ml-2 text-sm font-medium text-white/45">JPY / kg</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/45">
                      基準仕入原価は最新1件、その他の内訳は同じ構成要素の最新履歴だけを採用して集計しています。
                    </p>
                    {currentProductCostSummary.excluded > 0 && (
                      <p className="mt-1 text-[10px] text-amber-200/60">
                        単位または通貨が異なる {currentProductCostSummary.excluded} 件は合計から除外しています。
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:max-w-md md:justify-end">
                    {currentProductCostSummary.rows.map((row) => (
                      <span key={row.id} className="rounded-lg border border-white/10 bg-black/10 px-2.5 py-1.5 text-[10px] text-white/60">
                        {row.label}: {Number(row.amount || 0).toLocaleString("ja-JP")}円
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.03] p-4">
              <div>
                <h3 className="text-sm font-semibold">原価履歴・内訳</h3>
                <p className="mt-1 text-xs text-white/40">反映済みの原価を確認できます。訂正は既存行を上書きせず、新しい履歴として追加します。</p>
              </div>

              <div className="mt-4 space-y-2">
                {productCosts.filter((row) => row.productId === editingProduct.id).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/35">この商品の原価履歴はまだありません。</div>
                ) : (
                  productCosts
                    .filter((row) => row.productId === editingProduct.id)
                    .map((row) => {
                      const labels: Record<string, string> = {
                        base_purchase: "基準仕入原価",
                        processing: "加工費",
                        packaging: "包装費",
                        labeling: "ラベル費",
                        inspection: "検査費",
                        domestic_freight: "国内運賃",
                        other: "その他",
                      }
                      return (
                        <div key={row.id} className="grid gap-2 rounded-xl border border-white/10 bg-black/10 p-3 md:grid-cols-[130px_1fr_140px_110px]">
                          <div className="text-xs font-medium">{labels[row.costType] || row.costType}</div>
                          <div className="text-xs">
                            <div>{row.label}</div>
                            <div className="mt-1 text-[10px] text-white/35">{row.supplierOrVendor || "仕入先未設定"} {row.effectiveFrom ? " / " + row.effectiveFrom : ""}</div>
                          </div>
                          <div className="text-sm font-semibold">{Number(row.amount || 0).toLocaleString("ja-JP")} {row.currency}</div>
                          <div className="text-xs text-white/45">/ {row.unit || "kg"}</div>
                        </div>
                      )
                    })
                )}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-white/40">内訳を訂正・追加</div>
                <div className="grid gap-2 md:grid-cols-2">
                  <select className={inputClass} value={newProductCost.costType || "base_purchase"} onChange={(e) => setNewProductCost({ ...newProductCost, costType: e.target.value as ProductCost["costType"] })}>
                    <option value="base_purchase">基準仕入原価</option>
                    <option value="processing">加工費</option>
                    <option value="packaging">包装費</option>
                    <option value="labeling">ラベル費</option>
                    <option value="inspection">検査費</option>
                    <option value="domestic_freight">国内運賃</option>
                    <option value="other">その他</option>
                  </select>
                  <input className={inputClass} placeholder="内訳名 例: 根本さん加工費" value={newProductCost.label || ""} onChange={(e) => setNewProductCost({ ...newProductCost, label: e.target.value })} />
                  <input className={inputClass} placeholder="金額" value={newProductCost.amount || ""} onChange={(e) => setNewProductCost({ ...newProductCost, amount: e.target.value })} />
                  <input className={inputClass} placeholder="単位 例: kg" value={newProductCost.unit || "kg"} onChange={(e) => setNewProductCost({ ...newProductCost, unit: e.target.value })} />
                  <input className={inputClass} placeholder="仕入先・外注先" value={newProductCost.supplierOrVendor || ""} onChange={(e) => setNewProductCost({ ...newProductCost, supplierOrVendor: e.target.value })} />
                  <input type="date" className={inputClass} value={newProductCost.effectiveFrom || ""} onChange={(e) => setNewProductCost({ ...newProductCost, effectiveFrom: e.target.value })} />
                </div>
                <button type="button" onClick={() => addProductCostCorrection().catch((error) => alert(error instanceof Error ? error.message : "原価履歴の追加に失敗しました。"))} className="mt-3 rounded-full bg-[#eef3ea] px-4 py-2 text-xs font-semibold text-[#11150f]">
                  訂正履歴を追加
                </button>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold">証明書・資料</h3><p className="mt-1 text-xs text-white/40">非公開ファイルの添付と、既存のURL資料を管理できます。</p></div>
                <button type="button" onClick={addDoc} className="rounded-full border border-white/10 px-3 py-2 text-xs">URL資料追加</button>
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <label className="block text-xs font-medium text-white/65">
                  非公開ファイルを添付
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx" disabled={docUploadBusy || productSaveBusy || !(auth.configured && auth.authenticated) || !products.some((item) => item.id === editingProduct.id)} onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (file) void uploadProductDoc(file)
                  }} className="mt-3 block w-full text-xs text-white/55 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white/75 disabled:opacity-40" />
                </label>
                <p className="mt-2 text-xs leading-5 text-white/40">PDF・画像・Word（DOCX）・Excel（XLSX）、1ファイル3MBまで。商品を保存した後に添付できます。添付はファイル選択後すぐ保存され、商品編集のキャンセルでも残ります。</p>
                {docUploadBusy && <p role="status" className="mt-2 text-xs text-white/65">資料を保存中...</p>}
                {docUploadMessage && <p role="status" className="mt-2 text-xs text-amber-100">{docUploadMessage}</p>}
                {productSaveBusy && <p role="status" className="mt-2 text-xs text-white/65">商品を保存中...</p>}
              </div>
              <div className="mt-4 space-y-2">
                {(editingProduct.docs || []).map((doc) => doc.isPrivate || doc.url.startsWith("products/") ? (
                  <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                    <div className="min-w-0">
                      <div className="break-all text-sm text-white/75">{doc.title}</div>
                      <div className="mt-1 text-[10px] text-white/40">非公開添付 · ログインと閲覧権限が必要</div>
                    </div>
                    <a href={`/api/workboard/documents?id=${encodeURIComponent(doc.id)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/5">ダウンロード</a>
                  </div>
                ) : (
                  <div key={doc.id} className="grid gap-2 md:grid-cols-[1fr_1.5fr_auto]">
                    <input className={inputClass} placeholder="資料名" value={doc.title} onChange={(e) => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).map((d) => d.id === doc.id ? { ...d, title: e.target.value } : d) })} />
                    <input className={inputClass} placeholder="URL" value={doc.url} onChange={(e) => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).map((d) => d.id === doc.id ? { ...d, url: e.target.value } : d) })} />
                    <button type="button" data-operation-sound="click" onClick={() => setEditingProduct({ ...editingProduct, docs: (editingProduct.docs || []).filter((d) => d.id !== doc.id) })} className="rounded-xl px-3 text-red-400"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
            </section>

            <ModalActions deleteDisabled={!trashConfigured} busy={mutationBusy || productSaveBusy || docUploadBusy} existing={products.some((item) => item.id === editingProduct.id)} onDelete={() => deleteRecord("product", editingProduct.id)} onCancel={() => { if (!(mutationBusy || productSaveBusy || docUploadBusy)) setEditingProduct(null) }} />
          </fieldset>
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

async function readAiImportData(signal?: AbortSignal): Promise<{ batches: AiImportBatch[]; candidates: AiImportCandidate[] }> {
  const response = await workboardFetch("/api/workboard/ai-import", { cache: "no-store", signal })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || "AI取込候補を読み込めませんでした。")
  if (!Array.isArray(data.batches) || !Array.isArray(data.candidates)) throw new Error("AI取込候補の応答を確認できませんでした。再読み込みしてください。")
  return { batches: data.batches, candidates: data.candidates }
}

async function readWorkboardSession(): Promise<{ configured: boolean; authenticated: boolean; user?: AuthState["user"] }> {
  const response = await fetch("/api/workboard/auth/session", { cache: "no-store" })
  const data = await response.json().catch(() => ({}))
  if ((!response.ok && response.status !== 401 && response.status !== 403) || typeof data.configured !== "boolean" || typeof data.authenticated !== "boolean") throw new Error("ログイン状態を確認できませんでした。")
  return data
}

async function readSharedWorkboardData(): Promise<Record<string, any>> {
  const response = await workboardFetch("/api/workboard/data", { cache: "no-store" })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || "共有DBを読み込めませんでした。")
  if (["work", "salesCases", "orders", "customers", "products", "productCosts", "events", "shippingRates", "trash"].some((key) => !Array.isArray(data[key]))) throw new Error("共有データの応答を確認できませんでした。")
  return data
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-white/55">{label}</span>{children}</label>
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search className="size-4 text-white/35" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25" /></label>
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-white text-[#11150f]" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>{icon}{label}</button>
}

const SALES_EVENT_LABELS: Record<string, string> = {
  email_sent: "メール送信",
  contact_sent: "連絡実施",
  reply_received: "返信・反応あり",
  contact_received: "問い合わせ・初回受信",
  quote_sent: "見積提示",
  sample_sent: "サンプル送付",
  note: "メモ",
}

function salesEventMedia(event: WorkEvent) {
  if (event.channel) return CHANNELS.includes(event.channel) ? event.channel : ""
  return ["email_sent", "reply_received"].includes(event.eventType) ? "Email" : ""
}

function Kpi({ label, value, detail, description, onClick, active = false }: { label: string; value: string | number; detail?: string; description?: string; onClick?: () => void; active?: boolean }) {
  const content = (
    <>
      <div className="text-[10px] font-semibold tracking-[0.14em] text-white/35">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {detail && <div className="mt-2 text-xs leading-5 text-white/65">{detail}</div>}
      {description && <p className="mt-1 text-[10px] leading-4 text-white/40">{description}</p>}
    </>
  )
  const className = "rounded-2xl border px-4 py-3"
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={`${className} text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${active ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.08]"}`}>
        {content}
      </button>
    )
  }
  return <div className={`${className} border-white/10 bg-white/[0.045]`}>{content}</div>
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

function ModalActions({ existing, onDelete, onCancel, busy = false, deleteDisabled = false }: { existing: boolean; onDelete: () => void; onCancel: () => void; busy?: boolean; deleteDisabled?: boolean }) {
  return <div className="mt-6 flex items-center justify-between gap-3">{existing ? <button type="button" disabled={busy || deleteDisabled} title={deleteDisabled ? "ゴミ箱用のDB更新が必要です" : "ゴミ箱へ移動"} onClick={() => { if (window.confirm("ゴミ箱へ移動しますか？あとから復元できます。")) onDelete() }} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10"><Trash2 className="size-4" />ゴミ箱へ</button> : <span />}<div className="flex gap-2"><button type="button" disabled={busy} onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm">キャンセル</button><button type="submit" disabled={busy} className="disabled:opacity-40 rounded-full bg-[#eef3ea] px-5 py-2.5 text-sm font-medium text-[#11150f]">{busy ? "処理中..." : "保存"}</button></div></div>
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


function isAiCandidateApplied(note?: string | null) {
  return /正式反映処理中:|正式反映済み|正式業務|既存取引先|新規取引先|既存商品|新規商品|原価履歴へ反映|取引先価格履歴へ反映|送料マスタへ反映|業務履歴へ反映|既存業務 .* を更新|案件BOX .* を作成|既存案件BOX .* を更新/.test(note || "")
}
