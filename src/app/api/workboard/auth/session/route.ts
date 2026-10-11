import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function GET() {
  if (!url || !publishableKey) {
    return NextResponse.json({ configured: false, authenticated: false })
  }

  const cookieStore = await cookies()
  let accessToken = cookieStore.get("shojuen_sb_access")?.value
  const refreshToken = cookieStore.get("shojuen_sb_refresh")?.value
  let refreshed: { access_token: string; refresh_token: string; expires_in: number } | null = null
  let userResponse: Response | null = null

  if (accessToken) {
    userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!userResponse.ok && userResponse.status !== 401 && userResponse.status !== 403) {
      return NextResponse.json({ error: "ログイン状態を確認できませんでした。" }, { status: 503 })
    }
  }
  let expiresSoon = false
  if (accessToken) {
    try {
      // Only a refresh hint; authentication still requires /auth/v1/user.
      const claims = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString())
      expiresSoon = typeof claims.exp === "number" && claims.exp * 1000 < Date.now() + 60_000
    } catch { /* The user endpoint validates malformed tokens. */ }
  }
  if ((!userResponse?.ok || expiresSoon) && refreshToken) {
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    })
    if (!response.ok) {
      if (response.status >= 500 || response.status === 429) {
        return NextResponse.json({ error: "ログインを更新できませんでした。再試行してください。" }, { status: 503 })
      }
      return NextResponse.json({ configured: true, authenticated: false }, { status: 401 })
    }
    const data = await response.json()
    if (!data.access_token || !data.refresh_token) {
      return NextResponse.json({ error: "ログイン更新の応答を確認できませんでした。" }, { status: 503 })
    }
    refreshed = data
    accessToken = data.access_token
    userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!userResponse.ok && userResponse.status >= 500) {
      return NextResponse.json({ error: "ログイン状態を確認できませんでした。" }, { status: 503 })
    }
  }
  if (!userResponse?.ok) {
    return NextResponse.json({ configured: true, authenticated: false }, { status: 401 })
  }

  const user = await userResponse.json()

  const membership = await fetch(
    `${url}/rest/v1/app_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id,role,display_name`,
    {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  )

  if (!membership.ok) {
    if (membership.status !== 401 && membership.status !== 403) {
      return NextResponse.json({ error: "利用権限を確認できませんでした。" }, { status: 503 })
    }
    return NextResponse.json({ configured: true, authenticated: false }, { status: 403 })
  }

  const rows = await membership.json()
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ configured: true, authenticated: false }, { status: 403 })
  }

  const result = NextResponse.json({
    configured: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: rows[0].role,
      displayName: rows[0].display_name,
    },
  })
  if (refreshed) {
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" }
    result.cookies.set("shojuen_sb_access", refreshed.access_token, { ...options, maxAge: refreshed.expires_in || 3600 })
    result.cookies.set("shojuen_sb_refresh", refreshed.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 })
  }
  return result
}
