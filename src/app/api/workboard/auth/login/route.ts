import { NextRequest, NextResponse } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function POST(request: NextRequest) {
  if (!url || !publishableKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const email = body?.email?.trim()
  const password = body?.password

  if (!email || !password) {
    return NextResponse.json({ error: "メールアドレスとパスワードが必要です。" }, { status: 400 })
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.msg || data?.error_description || "ログインできませんでした。" },
      { status: response.status }
    )
  }

  const result = NextResponse.json({
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  })

  result.cookies.set("shojuen_sb_access", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in || 3600,
  })

  if (data.refresh_token) {
    result.cookies.set("shojuen_sb_refresh", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return result
}
