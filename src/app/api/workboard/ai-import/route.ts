import { buildWorkUpdatePatch, workUpdateValue } from "../../../sales-kanban/work-update"
import { POST as saveCaseData } from "../data/route"
import { buildSalesCaseUpdatePatch, SALES_CASE_UPDATE_FIELDS, salesCaseUpdateValue } from "../../../../lib/sales-case-update"
import { stageRecordNote } from "../../../../lib/workboard-time-analysis"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get("shojuen_sb_access")?.value || null
}

async function sb(path: string, token: string, init: RequestInit = {}) {
  if (!url || !publishableKey) throw new Error("Supabase is not configured")
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Supabase request failed: ${response.status}`)
  }
  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}


function decodedCandidate(candidate: any) {
  if (candidate?.candidate_type === "decision" && ["new_sales_case","sales_case_update"].includes(candidate?.payload?._workboard_candidate_type)) {
    const payload = { ...candidate.payload }
    delete payload._workboard_candidate_type
    return { ...candidate, candidate_type: candidate.payload._workboard_candidate_type, payload }
  }
  return candidate
}

function encodedCandidate(type: string, payload: Record<string, unknown>) {
  const clean = { ...payload }
  delete clean._workboard_candidate_type
  return ["new_sales_case","sales_case_update"].includes(type)
    ? { candidate_type: "decision", payload: { ...clean, _workboard_candidate_type: type } }
    : { candidate_type: type, payload: clean }
}

const APPLIED_NOTE = /正式業務|既存取引先|新規取引先|既存商品|新規商品|原価履歴へ反映|取引先価格履歴へ反映|送料マスタへ反映|業務履歴へ反映|既存業務 .* を更新|案件BOX .* を作成|既存案件BOX .* を更新/
const APPLYING_NOTE = "正式反映処理中:"

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [batches, candidates] = await Promise.all([
      sb("ai_import_batches?select=*&order=created_at.desc", token),
      sb("ai_import_candidates?select=*&order=created_at.desc", token),
    ])

    return NextResponse.json({
      batches: batches || [],
      candidates: (candidates || []).map(decodedCandidate),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load AI imports" },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const source = body?.source
    const sessionTitle = body?.session_title
    const sourceSessionId = body?.source_session_id || null
    const sourceTimestamp = body?.source_timestamp || null
    const summary = body?.summary || null
    const candidates = Array.isArray(body?.candidates) ? body.candidates : []

    if (!["chatgpt", "claude", "manual", "other"].includes(source)) {
      return NextResponse.json({ error: "source が不正です。" }, { status: 400 })
    }
    if (!sessionTitle || typeof sessionTitle !== "string") {
      return NextResponse.json({ error: "session_title は必須です。" }, { status: 400 })
    }
    if (candidates.length === 0 || candidates.length > 100) {
      return NextResponse.json({ error: "candidates は1〜100件で指定してください。" }, { status: 400 })
    }

    const allowedTypes = new Set([
      "new_sales_case",
      "sales_case_update",
      "new_work",
      "work_update",
      "work_event",
      "customer_update",
      "product_update",
      "price_candidate",
      "decision",
    ])

    for (const candidate of candidates) {
      if (!allowedTypes.has(candidate?.candidate_type)) {
        return NextResponse.json(
          { error: `未対応の candidate_type: ${candidate?.candidate_type || "(empty)"}` },
          { status: 400 }
        )
      }
      if (!candidate?.title || typeof candidate.title !== "string") {
        return NextResponse.json({ error: "各candidateの title は必須です。" }, { status: 400 })
      }
      if (candidate.confidence != null) {
        const confidence = Number(candidate.confidence)
        if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
          return NextResponse.json({ error: "confidence は0〜1で指定してください。" }, { status: 400 })
        }
      }
    }

    if (sourceSessionId) {
      const existing = await sb(
        `ai_import_batches?select=id&source=eq.${encodeURIComponent(source)}&source_session_id=eq.${encodeURIComponent(sourceSessionId)}&limit=1`,
        token
      )
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: "同じ source_session_id の取込が既に存在します。", duplicate: true },
          { status: 409 }
        )
      }
    }

    const insertedBatch = await sb("ai_import_batches", token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        source,
        source_session_id: sourceSessionId,
        session_title: sessionTitle.trim(),
        source_timestamp: sourceTimestamp,
        summary,
        raw_payload: body,
        status: "pending",
      }),
    })

    const batch = Array.isArray(insertedBatch) ? insertedBatch[0] : null
    if (!batch?.id) throw new Error("AI取込バッチを作成できませんでした。")

    await sb("ai_import_candidates", token, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(
        candidates.map((candidate: any) => ({
          batch_id: batch.id,
          ...encodedCandidate(candidate.candidate_type, candidate.payload && typeof candidate.payload === "object" && !Array.isArray(candidate.payload) ? candidate.payload : {}),
          target_id: candidate.target_id || null,
          title: candidate.title.trim(),
          confidence: candidate.confidence == null ? null : Number(candidate.confidence),
          status: "pending",
        }))
      ),
    })

    return NextResponse.json({ ok: true, batchId: batch.id, candidateCount: candidates.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import AI summary" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const id = body?.id
    if (body?.action === "edit") {
      const types = ["sales_case_update", "new_sales_case", "new_work", "work_update", "work_event", "customer_update", "product_update", "price_candidate", "decision"]
      if (typeof id !== "string" || !id.trim() || typeof body.title !== "string" || !body.title.trim() || !types.includes(body.candidateType) || !body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
        return NextResponse.json({ error: "件名・分類・詳細JSONを確認してください。" }, { status: 400 })
      }
      const rows = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      const candidate = Array.isArray(rows) ? decodedCandidate(rows[0]) : null
      if (!candidate) return NextResponse.json({ error: "候補が見つかりません。" }, { status: 404 })
      const applied = /正式業務|既存取引先|新規取引先|既存商品|新規商品|原価履歴へ反映|取引先価格履歴へ反映|送料マスタへ反映|業務履歴へ反映|既存業務 .* を更新|案件BOX .* を作成|既存案件BOX .* を更新/
      if (applied.test(candidate.decision_note || "") || String(candidate.decision_note || "").startsWith(APPLYING_NOTE)) {
        return NextResponse.json({ error: "正式反映済みの候補は編集できません。反映先の業務・履歴・マスタで修正してください。" }, { status: 409 })
      }
      const updated = await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          title: body.title.trim(),
          ...encodedCandidate(body.candidateType, body.payload),
          target_id: candidate.candidate_type === body.candidateType ? candidate.target_id : null,
          status: "pending",
          decision_note: "候補を編集。正式反映前の再確認が必要です。",
          reviewed_at: null,
        }),
      })
      if (!Array.isArray(updated) || !updated[0]) throw new Error("保存結果を確認できませんでした。")
      return NextResponse.json({ ok: true, candidate: decodedCandidate(updated[0]) })
    }
    const status = body?.status
    const decisionNote = body?.decisionNote ?? (body?.status === "approved" ? "候補だけ承認（正式反映なし）" : null)
    const payloadPatch = body?.payloadPatch && typeof body.payloadPatch === "object" ? body.payloadPatch : null

    if (!id || !["approved", "rejected", "needs_edit", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const reviewRows = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
    const reviewCandidate = reviewRows?.[0]
    if (!reviewCandidate) return NextResponse.json({ error: "候補が見つかりません。" }, { status: 404 })
    if (APPLIED_NOTE.test(reviewCandidate.decision_note || "") || String(reviewCandidate.decision_note || "").startsWith(APPLYING_NOTE)) {
      return NextResponse.json({ error: "反映済み・処理中の候補の判定や内容は変更できません。反映先で確認してください。" }, { status: 409 })
    }

    let nextPayload: Record<string, unknown> | undefined
    if (payloadPatch) {
      const rows = await sb(
        `ai_import_candidates?select=payload&id=eq.${encodeURIComponent(id)}&limit=1`,
        token
      )
      const currentPayload = Array.isArray(rows) && rows[0]?.payload && typeof rows[0].payload === "object"
        ? rows[0].payload
        : {}
      nextPayload = { ...currentPayload, ...payloadPatch }
    }

    await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status,
        decision_note: decisionNote,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
        ...(nextPayload ? { payload: nextPayload } : {}),
      }),
    })

    return NextResponse.json({ ok: true, decisionNote })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update AI import" },
      { status: 500 }
    )
  }
}


export async function PUT(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const id = body?.id
    const candidateType = body?.candidate_type
    const payload = body?.payload

    if (!id || !candidateType || !payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const allowedTypes = new Set([
      "new_sales_case",
      "sales_case_update",
      "new_work",
      "work_update",
      "work_event",
      "customer_update",
      "product_update",
      "price_candidate",
      "decision",
    ])

    if (!allowedTypes.has(candidateType)) {
      return NextResponse.json({ error: "Unsupported candidate_type" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const needsClaim = ["new_work", "customer_update", "product_update", "price_candidate"].includes(candidateType)
    let applyCandidate: any = null
    if (needsClaim) {
      const rows = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      applyCandidate = rows?.[0] && decodedCandidate(rows[0])
      if (!applyCandidate || applyCandidate.candidate_type !== candidateType) return NextResponse.json({ error: "候補が見つからないか分類が変更されています。" }, { status: 409 })
      if (APPLIED_NOTE.test(applyCandidate.decision_note || "")) return NextResponse.json({ ok: true, alreadyApplied: true, decisionNote: applyCandidate.decision_note })
      if (String(applyCandidate.decision_note || "").startsWith(APPLYING_NOTE)) return NextResponse.json({ error: "この候補は処理中、または保存結果の確認が必要です。反映先を確認し、重ねて反映しないでください。" }, { status: 409 })
    }
    async function claimCandidate() {
      const noteFilter = applyCandidate.decision_note == null ? "decision_note=is.null" : "decision_note=eq." + encodeURIComponent(applyCandidate.decision_note)
      const claimed = await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}&status=eq.${encodeURIComponent(applyCandidate.status)}&${noteFilter}`, token!, {
        method: "PATCH", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ decision_note: APPLYING_NOTE + now }),
      })
      if (!claimed?.length) throw new Error("別の操作がこの候補を変更・反映しています。再読み込みしてください。")
    }

    if (candidateType === "sales_case_update") {
      const candidates = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      const candidate = candidates?.[0] && decodedCandidate(candidates[0])
      if (!candidate || candidate.candidate_type !== "sales_case_update") return NextResponse.json({ error: "案件BOX更新候補が見つからないか、分類が変更されています。再読み込みしてください。" }, { status: 409 })
      if (/既存案件BOX .* を更新/.test(candidate.decision_note || "")) return NextResponse.json({ ok: true, salesCaseId: candidate.target_id, decisionNote: candidate.decision_note, alreadyApplied: true })
      let patch: Record<string, string | null>
      try {
        patch = buildSalesCaseUpdatePatch(payload)
        if (JSON.stringify(patch) !== JSON.stringify(buildSalesCaseUpdatePatch(candidate.payload || {}))) return NextResponse.json({ error: "候補の変更内容が変わっています。候補を保存して再確認してください。" }, { status: 409 })
      } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "変更内容を確認してください。" }, { status: 400 }) }
      const salesCaseId = String(payload.sales_case_id || "").trim()
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salesCaseId)) return NextResponse.json({ error: "更新する既存案件BOXを選択してください。" }, { status: 400 })
      const rows = await sb(`sales_cases?select=*&id=eq.${encodeURIComponent(salesCaseId)}&deleted_at=is.null&limit=1`, token)
      const current = rows?.[0]
      if (!current) return NextResponse.json({ error: "更新先の案件BOXが見つかりません。ゴミ箱・紐づけ先を確認してください。" }, { status: 404 })
      const expected = body.expectedCase
      if (!expected || typeof expected !== "object" || Array.isArray(expected) || Object.keys(patch).some((key) => !Object.prototype.hasOwnProperty.call(expected, key))) return NextResponse.json({ error: "変更前の内容を確認できません。再読み込みしてください。" }, { status: 409 })
      const noChange = Object.keys(patch).every((key) => salesCaseUpdateValue(current[key]) === salesCaseUpdateValue(patch[key]))
      if (!noChange && Object.keys(patch).some((key) => salesCaseUpdateValue(current[key]) !== salesCaseUpdateValue(expected[key]))) return NextResponse.json({ error: "案件の内容が別の操作で変更されています。再読み込みして変更前後を確認してください。" }, { status: 409 })
      let warning = ""
      if (!noChange) {
        const merged = { ...current, ...patch }
        const links = await sb(`sales_case_products?select=product_id&sales_case_id=eq.${encodeURIComponent(salesCaseId)}`, token)
        const data = {
          ...Object.fromEntries(SALES_CASE_UPDATE_FIELDS.map((field) => [field.uiKey, merged[field.key] || ""])),
          id: salesCaseId, customerId: current.customer_id, productIds: (links || []).map((link: any) => link.product_id),
          lastContactAt: current.last_contact_at || "", wonAt: current.won_at || "", closedAt: current.closed_at || "",
          expectedStage: current.stage, expectedUpdatedAt: current.updated_at,
        }
        const savedResponse = await saveCaseData(new NextRequest("http://workboard.local/api/workboard/data", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "sales_case", data }),
        }))
        const saved = await savedResponse.json()
        if (!savedResponse.ok) return NextResponse.json(saved, { status: savedResponse.status })
        warning = saved.warning || ""
      }
      const decisionNote = `既存案件BOX ${salesCaseId} を更新`
      try {
        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH", headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ status: "approved", target_id: salesCaseId, reviewed_at: now, decision_note: decisionNote }),
        })
      } catch { warning = [warning, "案件BOXは保存済みですが、候補の反映済み記録に失敗しました。再取込せず、案件BOXを確認してください。"].filter(Boolean).join(" ") }
      return NextResponse.json({ ok: true, salesCaseId, decisionNote, noChange, warning })
    }


    if (candidateType === "new_sales_case") {
      const rows = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      const candidate = rows?.[0] && decodedCandidate(rows[0])
      if (!candidate || candidate.candidate_type !== "new_sales_case" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate.id)) {
        return NextResponse.json({ error: "新規案件BOX候補が見つからないか、分類が変更されています。再読み込みしてください。" }, { status: 409 })
      }
      // The candidate UUID is also this import's box UUID, so retries cannot create another box.
      const salesCaseId = candidate.id
      const existing = await sb(`sales_cases?select=*&id=eq.${encodeURIComponent(salesCaseId)}&limit=1`, token)
      if (existing?.[0]?.deleted_at) return NextResponse.json({ error: "この候補の案件BOXはゴミ箱内です。ゴミ箱から復元してください。" }, { status: 409 })
      let created = false
      let warning = ""
      if (!existing?.length) {
        const customerId = typeof payload.customer_id === "string" ? payload.customer_id.trim() : ""
        const title = String(candidate.title || payload.title || "").trim()
        const theme = String(payload.theme || title).trim()
        const assignee = typeof payload.assignee === "string" ? payload.assignee.trim() : ""
        const caseType = payload.case_type || "new_business"
        const stage = payload.stage || "uncontacted"
        const heat = payload.heat || "B"
        if (!customerId || !title || !theme || !assignee) return NextResponse.json({ error: "取引先・案件名・テーマ・担当者を確認してください。" }, { status: 400 })
        if (!["new_business","existing_followup"].includes(caseType) || !["uncontacted","initial_sent","replied","qualifying","quoted","sample_requested","sample_sent","considering","won","lost","hold"].includes(stage) || !["A","B","C"].includes(heat)) {
          return NextResponse.json({ error: "案件区分・状態・温度感を確認してください。" }, { status: 400 })
        }
        if (["theme","next_action","origin_type","channel"].some((key) => payload[key] != null && typeof payload[key] !== "string")) return NextResponse.json({ error: "案件の詳細項目は文字列で入力してください。" }, { status: 400 })
        const date = payload.next_follow_up_date
        if (date && (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + "T00:00:00Z")) || new Date(date + "T00:00:00Z").toISOString().slice(0,10) !== date)) return NextResponse.json({ error: "次回フォロー日は有効なYYYY-MM-DDで入力してください。" }, { status: 400 })
        if ((payload.origin_type && !["Outbound","Inbound","Referral","Existing"].includes(payload.origin_type)) || (payload.channel && !["Email","Instagram DM","Threads","LinkedIn","Web","電話","展示会","紹介","その他"].includes(payload.channel))) {
          return NextResponse.json({ error: "接点区分・媒体を確認してください。" }, { status: 400 })
        }
        const customers = await sb(`customers?select=id&id=eq.${encodeURIComponent(customerId)}&deleted_at=is.null&limit=1`, token)
        if (!customers?.length) return NextResponse.json({ error: "取引先が見つかりません。取引先候補を先に反映するか、ゴミ箱から復元してください。" }, { status: 404 })
        const productIds = payload.product_ids == null ? [] : payload.product_ids
        if (!Array.isArray(productIds) || productIds.some((value: unknown) => typeof value !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(value))) return NextResponse.json({ error: "関連商品を確認してください。" }, { status: 400 })
        const uniqueProducts = [...new Set(productIds)] as string[]
        if (uniqueProducts.length) {
          const products = await sb(`products?select=id&id=in.(${uniqueProducts.map(encodeURIComponent).join(",")})&deleted_at=is.null`, token)
          if (uniqueProducts.some((productId) => !products?.some((product: any) => product.id === productId))) return NextResponse.json({ error: "関連商品が見つかりません。選び直してください。" }, { status: 404 })
        }
        const inserted = await sb("sales_cases?on_conflict=id", token, {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify({
            id: salesCaseId, customer_id: customerId, title, theme, case_type: caseType, stage, heat, assignee,
            next_follow_up_date: date || null, next_action: payload.next_action || null,
            origin_type: payload.origin_type || null, channel: payload.channel || null,
            won_at: stage === "won" ? now : null, closed_at: ["won","lost"].includes(stage) ? now : null,
            updated_at: now,
          }),
        })
        created = Boolean(inserted?.length)
        if (!created) {
          const concurrent = await sb(`sales_cases?select=id,deleted_at&id=eq.${encodeURIComponent(salesCaseId)}&limit=1`, token)
          if (!concurrent?.length || concurrent[0].deleted_at) return NextResponse.json({ error: "案件BOXの保存結果を確認できません。再読み込みしてください。" }, { status: 409 })
        } else if (uniqueProducts.length) {
          try {
            await sb("sales_case_products", token, {
              method: "POST",
              headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
              body: JSON.stringify(uniqueProducts.map((productId) => ({ sales_case_id: salesCaseId, product_id: productId }))),
            })
          } catch { warning = "案件BOXは作成済みですが、関連商品の登録に失敗しました。BOXを開いて関連商品を確認してください。" }
        }
      }
      if (created) {
        try {
          await sb("work_events", token, {
            method: "POST", headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ sales_case_id: salesCaseId, event_type: "note", event_date: now, source: "workboard_auto",
              note: stageRecordNote(null, payload.stage || "uncontacted", { channel: payload.channel, originType: payload.origin_type, caseType: payload.case_type }) }),
          })
        } catch { warning = [warning, "案件BOXは作成済みですが、段階の開始日時を記録できませんでした。滞在日数は不明として扱います。"].filter(Boolean).join(" ") }
      }
      const decisionNote = `案件BOX ${salesCaseId} を作成`
      try {
        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH", headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ status: "approved", target_id: salesCaseId, reviewed_at: now, decision_note: decisionNote }),
        })
      } catch { warning = [warning, "案件BOXは作成済みですが、候補の反映済み記録に失敗しました。同じJSONを再取込せず、作成したBOXを確認してください。"].filter(Boolean).join(" ") }
      return NextResponse.json({ ok: true, salesCaseId, decisionNote, alreadyApplied: !created, warning })
    }

    if (candidateType === "work_update") {
      const candidates = await sb(`ai_import_candidates?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      const candidate = Array.isArray(candidates) ? candidates[0] : null
      if (!candidate || candidate.candidate_type !== "work_update") {
        return NextResponse.json({ error: "業務更新候補が見つからないか、分類が変更されています。再読み込みしてください。" }, { status: 409 })
      }
      if (/既存業務 .* を更新/.test(candidate.decision_note || "")) {
        return NextResponse.json({ ok: true, workId: candidate.target_id, alreadyApplied: true })
      }
      const workId = String(payload.work_item_id || "").trim()
      if (!workId) return NextResponse.json({ error: "更新する既存業務を選択してください。" }, { status: 400 })
      let patch: Record<string, string | null>
      try {
        patch = buildWorkUpdatePatch(payload)
        const savedPatch = buildWorkUpdatePatch(candidate.payload || {})
        if (JSON.stringify(patch) !== JSON.stringify(savedPatch)) {
          return NextResponse.json({ error: "候補の内容が変わっています。再読み込みして変更内容を確認してください。" }, { status: 409 })
        }
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "変更内容を確認してください。" }, { status: 400 })
      }
      const expected = body.expectedWork
      if (!expected || typeof expected !== "object" || Array.isArray(expected) || Object.keys(patch).some((key) => !Object.prototype.hasOwnProperty.call(expected, key))) {
        return NextResponse.json({ error: "変更前の内容を確認できません。再読み込みしてください。" }, { status: 409 })
      }
      const rows = await sb(`work_items?select=*&id=eq.${encodeURIComponent(workId)}&deleted_at=is.null&limit=1`, token)
      const current = Array.isArray(rows) ? rows[0] : null
      if (!current) return NextResponse.json({ error: "業務が見つかりません。ゴミ箱内の業務は復元してから更新してください。" }, { status: 404 })
      if (Object.keys(patch).some((key) => workUpdateValue(current[key]) !== workUpdateValue(expected[key]))) {
        return NextResponse.json({ error: "業務が別の操作で変更されています。再読み込みして差分を確認してください。" }, { status: 409 })
      }
      const unchanged = Object.keys(patch).every((key) => workUpdateValue(current[key]) === workUpdateValue(patch[key]))
      if (!unchanged) {
        const versionFilter = current.updated_at ? `updated_at=eq.${encodeURIComponent(current.updated_at)}` : "updated_at=is.null"
        const updated = await sb(`work_items?id=eq.${encodeURIComponent(workId)}&deleted_at=is.null&${versionFilter}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ ...patch, updated_at: now }),
        })
        if (!Array.isArray(updated) || !updated.length) {
          return NextResponse.json({ error: "反映中に業務が変更されました。再読み込みして差分を確認してください。" }, { status: 409 })
        }
      }
      const decisionNote = `既存業務 ${workId} を更新`
      try {
        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ status: "approved", reviewed_at: now, target_id: workId, decision_note: decisionNote }),
        })
      } catch {
        return NextResponse.json({ ok: true, workId, decisionNote, warning: "業務の更新は保存済みですが、候補の反映済み記録に失敗しました。業務の内容を確認し、同じ操作を繰り返さないでください。" })
      }
      return NextResponse.json({ ok: true, workId, decisionNote })
    }

    if (candidateType === "new_work") {
      const existing = await sb("work_items?select=id&order=created_at.desc&limit=500", token)
      const next = (existing || []).reduce((max: number, row: any) => {
        const m = String(row.id || "").match(/^W(\d+)$/i)
        return m ? Math.max(max, Number(m[1])) : max
      }, 0) + 1
      const idValue = `W${String(next).padStart(3, "0")}`

      const allowedStatuses = new Set(["todo","prep","doing","external_wait","internal_wait","decision","hold","done"])
      const rawStatus = String(payload.status || "todo")
      const statusMap: Record<string,string> = {
        "未着手":"todo","確認・準備中":"prep","対応中":"doing","相手待ち":"external_wait",
        "社内待ち":"internal_wait","要判断":"decision","保留":"hold","完了":"done"
      }
      const status = allowedStatuses.has(rawStatus) ? rawStatus : (statusMap[rawStatus] || "todo")

      await claimCandidate()
      await sb("work_items", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          id: idValue,
          title: body.title || "AI取込業務",
          status,
          customer_id: payload.customer_id || null,
          work_type: payload.work_type || payload.workType || null,
          assignee: payload.assignee || null,
          priority: ["低","中","高","緊急"].includes(payload.priority) ? payload.priority : null,
          due_date: payload.due_date || null,
          next_action: payload.next_action || null,
          country: payload.country || null,
          origin_type: ["Outbound","Inbound","Referral","Existing"].includes(payload.origin_type) ? payload.origin_type : null,
          channel: payload.channel || null,
          memo: payload.memo || payload.note || null,
          updated_at: now,
        }),
      })

      if (Array.isArray(payload.product_ids) && payload.product_ids.length > 0) {
        await sb("work_item_products", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(
            payload.product_ids.map((productId: string) => ({
              work_item_id: idValue,
              product_id: productId,
              relation_type: "related",
            }))
          ),
        })
      }

      await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "approved", reviewed_at: now, decision_note: `正式業務 ${idValue} として反映` }),
      })

      return NextResponse.json({ ok: true, createdId: idValue, decisionNote: `正式業務 ${idValue} として反映` })
    }


    if (candidateType === "customer_update") {
      const requestedCustomerId = payload.customer_id || null
      let customerId = requestedCustomerId

      if (!customerId) {
        const existingCustomers = await sb("customers?select=id&order=id.asc", token)
        const next = (existingCustomers || []).reduce((max: number, row: any) => {
          const m = String(row.id || "").match(/^C(\d+)$/i)
          return m ? Math.max(max, Number(m[1])) : max
        }, 0) + 1
        customerId = `C${String(next).padStart(3, "0")}`
      }

      const existingRows = await sb(
        `customers?select=*&id=eq.${encodeURIComponent(customerId)}&limit=1`,
        token
      )
      const existingCustomer = Array.isArray(existingRows) ? existingRows[0] : null

      const pick = (incoming: any, existing: any) =>
        incoming === undefined || incoming === null || incoming === "" ? (existing ?? null) : incoming

      const companyName = pick(payload.company_name || payload.name, existingCustomer?.name)
      if (!companyName) {
        return NextResponse.json({ error: "取引先名がないため正式反映できません。" }, { status: 400 })
      }

      await claimCandidate()
      await sb("customers?on_conflict=id", token, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          id: customerId,
          name: companyName,
          country: pick(payload.country, existingCustomer?.country),
          category: pick(payload.business_type || payload.category, existingCustomer?.category),
          contact_name: pick(payload.contact_name, existingCustomer?.contact_name),
          email: pick(payload.email, existingCustomer?.email),
          phone: pick(payload.phone, existingCustomer?.phone),
          instagram: pick(payload.instagram, existingCustomer?.instagram),
          linkedin: pick(payload.linkedin, existingCustomer?.linkedin),
          note: pick(payload.memo || payload.note || payload.requirements, existingCustomer?.note),
          updated_at: now,
        }),
      })

      await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "approved",
          reviewed_at: now,
          decision_note: existingCustomer
            ? `既存取引先 ${customerId} を更新`
            : `新規取引先 ${customerId} として登録`,
        }),
      })

      return NextResponse.json({
        ok: true,
        customerId,
        mode: existingCustomer ? "updated" : "created",
        decisionNote: existingCustomer ? `既存取引先 ${customerId} を更新` : `新規取引先 ${customerId} として登録`,
      })
    }


    if (candidateType === "product_update") {
      const requestedProductId = payload.product_id || null
      let productId = requestedProductId

      if (!productId) {
        const existingProducts = await sb("products?select=id&order=id.asc", token)
        const next = (existingProducts || []).reduce((max: number, row: any) => {
          const m = String(row.id || "").match(/^M(\d+)$/i)
          return m ? Math.max(max, Number(m[1])) : max
        }, 0) + 1
        productId = `M${String(next).padStart(3, "0")}`
      }

      const existingRows = await sb(
        `products?select=*&id=eq.${encodeURIComponent(productId)}&limit=1`,
        token
      )
      const existingProduct = Array.isArray(existingRows) ? existingRows[0] : null

      const pick = (incoming: any, existing: any) =>
        incoming === undefined || incoming === null || incoming === "" ? (existing ?? null) : incoming

      const productName = pick(payload.product_name || payload.name, existingProduct?.name)
      if (!productName) {
        return NextResponse.json({ error: "商品名がないため正式反映できません。" }, { status: 400 })
      }

      const docSummary = Array.isArray(payload.documents) && payload.documents.length
        ? payload.documents.map((doc: any) => {
            const bits = [
              doc.type || doc.title || "資料",
              doc.issuer ? `発行: ${doc.issuer}` : null,
              doc.report_no ? `番号: ${doc.report_no}` : null,
              doc.issued_at ? `発行日: ${doc.issued_at}` : null,
              doc.status ? `状態: ${doc.status}` : null,
              doc.note || null,
            ].filter(Boolean)
            return `・${bits.join(" / ")}`
          }).join("\n")
        : ""

      const incomingMemo = [payload.memo, payload.note, docSummary ? `【証明書・資料メタ情報】\n${docSummary}` : null]
        .filter(Boolean)
        .join("\n\n")
      const mergedMemo = [existingProduct?.memo, incomingMemo].filter(Boolean).join("\n\n")

      await claimCandidate()
      await sb("products?on_conflict=id", token, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          id: productId,
          name: productName,
          producer: pick(payload.supplier || payload.producer || payload.processor, existingProduct?.producer),
          origin: pick(payload.origin, existingProduct?.origin),
          use_case: pick(payload.use || payload.use_case, existingProduct?.use_case),
          color_note: pick(payload.color_note, existingProduct?.color_note),
          umami_note: pick(payload.umami_note, existingProduct?.umami_note),
          bitterness_note: pick(payload.bitterness_note, existingProduct?.bitterness_note),
          aroma_note: pick(payload.aroma_note || payload.flavor_note, existingProduct?.aroma_note),
          cost: existingProduct?.cost ?? null,
          standard_wholesale_price: existingProduct?.standard_wholesale_price ?? null,
          moq: pick(payload.moq, existingProduct?.moq),
          supply_status: pick(payload.supply_status || payload.stock, existingProduct?.supply_status),
          memo: mergedMemo || null,
          updated_at: now,
        }),
      })

      await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "approved",
          reviewed_at: now,
          decision_note: existingProduct
            ? `既存商品 ${productId} を更新（価格・原価は未変更）`
            : `新規商品 ${productId} として登録（価格・原価は未登録）`,
        }),
      })

      return NextResponse.json({
        ok: true,
        productId,
        mode: existingProduct ? "updated" : "created",
        decisionNote: existingProduct ? `既存商品 ${productId} を更新（価格・原価は未変更）` : `新規商品 ${productId} として登録（価格・原価は未登録）`,
      })
    }


    if (candidateType === "price_candidate") {
      const classification = String(payload.price_classification || "")

      if (classification === "supplier_cost") {
        const productId = String(payload.product_id || "").trim()
        if (!productId) {
          return NextResponse.json({ error: "商品を選択してください。" }, { status: 400 })
        }

        const amountRaw = payload.amount ?? payload.price ?? payload.cost
        const amount = Number(String(amountRaw ?? "").replace(/[,\s¥￥]/g, ""))
        if (!Number.isFinite(amount) || amount < 0) {
          return NextResponse.json({ error: "原価を数値として確認できません。" }, { status: 400 })
        }

        const costType = String(payload.cost_type || "base_purchase")
        const allowedCostTypes = new Set([
          "base_purchase","processing","packaging","labeling","inspection","domestic_freight","other"
        ])
        if (!allowedCostTypes.has(costType)) {
          return NextResponse.json({ error: "原価区分が不正です。" }, { status: 400 })
        }

        const components = Array.isArray(payload.cost_rows) ? payload.cost_rows : [payload]
        if (!components.length || components.length > 100) return NextResponse.json({ error: "原価内訳は1～100件で指定してください。" }, { status: 400 })
        const costRows = []
        for (const row of components) {
          const raw = row.amount ?? row.price ?? row.cost
          const value = Number(String(raw ?? "").replace(/[,\s¥￥]/g, ""))
          const kind = row.cost_type || costType
          if (raw == null || raw === "" || !Number.isFinite(value) || value < 0 || !allowedCostTypes.has(kind)) return NextResponse.json({ error: "原価内訳の区分と金額を確認してください。" }, { status: 400 })
          costRows.push({ product_id: productId, cost_type: kind, label: row.label || body.title || "AI取込原価",
            amount: value, currency: row.currency || "JPY", unit: row.unit || "kg", quantity_basis: row.quantity_basis ? Number(row.quantity_basis) : null,
            effective_from: row.effective_from || now.slice(0, 10), supplier_or_vendor: row.supplier_or_vendor || row.supplier || null,
            note: row.note || row.memo || null, ai_locked: true, approved_at: now })
        }
        await claimCandidate()
        await sb("product_costs", token, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(costRows) })

        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "approved",
            reviewed_at: now,
            decision_note: `原価履歴へ反映（${productId} / ${costType}）`,
          }),
        })

        return NextResponse.json({ ok: true, applied: "product_cost", productId, costType, decisionNote: `原価履歴へ反映（${productId} / ${costType}）` })
      }

      if (classification === "customer_quoted") {
        const customerId = String(payload.customer_id || "").trim()
        const productId = String(payload.product_id || "").trim()
        if (!customerId || !productId) {
          return NextResponse.json({ error: "取引先と商品を選択してください。" }, { status: 400 })
        }

        const amountRaw = payload.amount ?? payload.price
        const amount = Number(String(amountRaw ?? "").replace(/[,\s¥￥]/g, ""))
        if (!Number.isFinite(amount) || amount < 0) {
          return NextResponse.json({ error: "提示価格を数値として確認できません。" }, { status: 400 })
        }

        await claimCandidate()
        await sb("customer_prices", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            customer_id: customerId,
            product_id: productId,
            price: amount,
            currency: payload.currency || "JPY",
            unit: payload.unit || "kg",
            moq: payload.moq || null,
            shipping_terms: payload.shipping_terms || null,
            payment_terms: payload.payment_terms || null,
            effective_from: payload.effective_from || new Date().toISOString().slice(0, 10),
            is_current: true,
            ai_locked: true,
            approved_at: now,
            note: payload.note || payload.memo || body.title || null,
          }),
        })

        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "approved",
            reviewed_at: now,
            decision_note: `取引先価格履歴へ反映（${customerId} / ${productId}）`,
          }),
        })

        return NextResponse.json({ ok: true, applied: "customer_price", customerId, productId, decisionNote: `取引先価格履歴へ反映（${customerId} / ${productId}）` })
      }

      if (classification !== "shipping_rate") {
        return NextResponse.json(
          { error: "この価格種別の正式反映はまだ手動確認対象です。" },
          { status: 409 }
        )
      }

      const rateStage = String(payload.shipping_stage || "")
      if (!["estimate", "quoted", "actual"].includes(rateStage)) {
        return NextResponse.json({ error: "送料の状態（概算 / 提示 / 実績）を選んでください。" }, { status: 400 })
      }

      const amountRaw =
        payload.amount ??
        payload.price ??
        payload.shipping_cost ??
        payload.freight ??
        payload.cost
      const amount = Number(String(amountRaw ?? "").replace(/[,\s¥￥]/g, ""))
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "送料金額を数値として確認できません。JSON詳細の金額を確認してください。" }, { status: 400 })
      }

      const destination = String(
        payload.destination ||
        payload.country ||
        payload.destination_country ||
        ""
      ).trim()
      if (!destination) {
        return NextResponse.json({ error: "配送先が確認できません。送料マスタ反映前に配送先が必要です。" }, { status: 400 })
      }

      const parseWeight = (value: unknown) => {
        if (value == null || value === "") return null
        const parsed = Number(String(value).replace(/[,\s]/g, "").replace(/kg$/i, ""))
        return Number.isFinite(parsed) ? parsed : null
      }
      const weightSingle = parseWeight(payload.weight_kg)
      const weightFrom = parseWeight(payload.weight_from_kg) ?? weightSingle
      const weightTo = parseWeight(payload.weight_to_kg) ?? weightSingle

      await claimCandidate()
      await sb("shipping_rates", token, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          origin: payload.origin || payload.origin_country || "Japan",
          destination,
          carrier: payload.carrier || null,
          service: payload.service || payload.shipping_method || null,
          weight_from_kg: Number.isFinite(weightFrom as number) ? weightFrom : null,
          weight_to_kg: Number.isFinite(weightTo as number) ? weightTo : null,
          size_class: payload.size_class || payload.size || null,
          price: amount,
          currency: payload.currency || "JPY",
          transit_time: payload.transit_time || payload.delivery_time || null,
          terms: payload.terms || payload.shipping_terms || null,
          source: payload.source || "ai_import",
          verified_at: rateStage === "actual" ? (payload.verified_at || payload.shipped_at || now) : (payload.verified_at || null),
          note: payload.note || payload.memo || body.title || null,
          rate_stage: rateStage,
          shipment_date: payload.shipment_date || payload.shipped_date || null,
          actual_weight_kg: parseWeight(payload.actual_weight_kg),
          customer_id: payload.customer_id || null,
          created_by: null,
          updated_at: now,
        }),
      })

      await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "approved",
          reviewed_at: now,
          decision_note: `送料マスタへ反映（${rateStage}）`,
        }),
      })

      return NextResponse.json({ ok: true, applied: "shipping_rate", rateStage, decisionNote: `送料マスタへ反映（${rateStage}）` })
    }


    if (candidateType === "work_event") {
      const candidateRows = await sb(`ai_import_candidates?select=id,candidate_type&id=eq.${encodeURIComponent(id)}&limit=1`, token)
      if (!candidateRows?.length || candidateRows[0].candidate_type !== "work_event") {
        return NextResponse.json({ error: "活動履歴候補が見つからないか、分類が変わっています。再読み込みしてください。" }, { status: 409 })
      }
      const existingEvents = await sb(`work_events?select=id,work_item_id,sales_case_id&source_candidate_id=eq.${encodeURIComponent(id)}&limit=1`, token)
      const existingEvent = existingEvents?.[0]
      let workId = existingEvent ? existingEvent.work_item_id : payload.work_item_id || null
      let salesCaseId = existingEvent ? existingEvent.sales_case_id : payload.sales_case_id || null
      let eventId = existingEvent?.id
      if (!existingEvent) {
        if ((workId && typeof workId !== "string") || (salesCaseId && typeof salesCaseId !== "string")) {
          return NextResponse.json({ error: "活動履歴の紐づけ先を確認してください。" }, { status: 400 })
        }
        let workCustomerId: string | null = null
        if (workId) {
          const rows = await sb(`work_items?select=id,customer_id,sales_case_id&id=eq.${encodeURIComponent(workId)}&deleted_at=is.null&limit=1`, token)
          if (!rows?.length) return NextResponse.json({ error: "関連業務が見つかりません。ゴミ箱内の場合は先に復元してください。" }, { status: 404 })
          workCustomerId = rows[0].customer_id || null
          if (!salesCaseId) salesCaseId = rows[0].sales_case_id || null
        }
        if (salesCaseId) {
          const rows = await sb(`sales_cases?select=id,customer_id&id=eq.${encodeURIComponent(salesCaseId)}&deleted_at=is.null&limit=1`, token)
          if (!rows?.length) return NextResponse.json({ error: "営業案件が見つかりません。ゴミ箱内の場合は先に復元してください。" }, { status: 404 })
          if ((workCustomerId && rows[0].customer_id !== workCustomerId) || (payload.customer_id && rows[0].customer_id !== payload.customer_id)) {
            return NextResponse.json({ error: "取引先と営業案件が一致していません。紐づけ先を選び直してください。" }, { status: 400 })
          }
        }
        const inserted = await sb("work_events", token, {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            work_item_id: workId,
            sales_case_id: salesCaseId,
            event_type: payload.event_type || "note",
            event_date: payload.event_date || payload.occurred_at || now,
            channel: payload.channel || null,
            note: payload.note || payload.memo || body.title || null,
            counterparty_name: payload.counterparty_name || null,
            counterparty_email: payload.counterparty_email || null,
            direction: payload.direction || null,
            source: "ai_import",
            source_candidate_id: id,
          }),
        })
        if (!inserted?.[0]?.id) throw new Error("活動履歴の保存結果を確認できませんでした。再読み込みしてください。")
        eventId = inserted[0].id
      }
      const decisionNote = salesCaseId ? `業務履歴へ反映（営業案件 ${salesCaseId}）` : workId ? `業務履歴へ反映（業務 ${workId}）` : "業務履歴へ反映（単独）"
      try {
        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ status: "approved", reviewed_at: now, decision_note: decisionNote }),
        })
      } catch {
        return NextResponse.json({ ok: true, eventId, workId, salesCaseId, decisionNote, warning: "活動履歴は保存済みですが、候補の反映済み記録に失敗しました。活動履歴を確認し、同じ候補を再取込しないでください。" })
      }
      return NextResponse.json({ ok: true, eventId, workId, salesCaseId, decisionNote, alreadyApplied: Boolean(existingEvent) })
    }

    return NextResponse.json(
      { error: "この候補種別の正式反映はまだ手動確認対象です。" },
      { status: 409 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply AI import" },
      { status: 500 }
    )
  }
}

