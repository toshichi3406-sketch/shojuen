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

    if (!id || !["approved", "rejected", "needs_edit"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    await sb(`ai_import_candidates?id=eq.${encodeURIComponent(id)}`, token, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status,
        decision_note: decisionNote,
        reviewed_at: new Date().toISOString(),
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

    if (candidateType === "work_event") {
      if (!payload.work_item_id) {
        return NextResponse.json({ error: "work_event は work_item_id が必要です。" }, { status: 400 })
      }

      await sb("work_events", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          work_item_id: payload.work_item_id,
          event_type: payload.event_type || "note",
          event_date: payload.event_date || payload.occurred_at || now,
          channel: payload.channel || null,
          note: payload.note || payload.memo || null,
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
