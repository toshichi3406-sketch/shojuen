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
