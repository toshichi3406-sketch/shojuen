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
