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
      candidates: candidates || [],
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
          candidate_type: candidate.candidate_type,
          target_id: candidate.target_id || null,
          title: candidate.title.trim(),
          payload: candidate.payload && typeof candidate.payload === "object" ? candidate.payload : {},
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
    const status = body?.status
    const decisionNote = body?.decisionNote ?? null
    const payloadPatch = body?.payloadPatch && typeof body.payloadPatch === "object" ? body.payloadPatch : null

    if (!id || !["approved", "rejected", "needs_edit", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
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

    return NextResponse.json({ ok: true })
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

      return NextResponse.json({ ok: true, createdId: idValue })
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

        await sb("product_costs", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            product_id: productId,
            cost_type: costType,
            label: payload.label || body.title || "AI取込原価",
            amount,
            currency: payload.currency || "JPY",
            unit: payload.unit || "kg",
            quantity_basis: payload.quantity_basis ? Number(payload.quantity_basis) : null,
            effective_from: payload.effective_from || new Date().toISOString().slice(0, 10),
            supplier_or_vendor: payload.supplier_or_vendor || payload.supplier || null,
            note: payload.note || payload.memo || null,
            ai_locked: true,
            approved_at: now,
          }),
        })

        await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "approved",
            reviewed_at: now,
            decision_note: `原価履歴へ反映（${productId} / ${costType}）`,
          }),
        })

        return NextResponse.json({ ok: true, applied: "product_cost", productId, costType })
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

        return NextResponse.json({ ok: true, applied: "customer_price", customerId, productId })
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

      return NextResponse.json({ ok: true, applied: "shipping_rate", rateStage })
    }

    if (candidateType === "work_event") {
      await sb("work_events", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          work_item_id: payload.work_item_id || null,
          event_type: payload.event_type || "note",
          event_date: payload.event_date || payload.occurred_at || now,
          channel: payload.channel || null,
          note: payload.note || payload.memo || null,
          counterparty_name: payload.counterparty_name || null,
          counterparty_email: payload.counterparty_email || null,
          direction: payload.direction || null,
          source: "ai_import",
          source_candidate_id: id,
        }),
      })

      await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "approved", reviewed_at: now, decision_note: "業務履歴へ反映" }),
      })

      return NextResponse.json({ ok: true })
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
