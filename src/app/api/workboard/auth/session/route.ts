import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function GET() {
  if (!url || !publishableKey) {
    return NextResponse.json({ configured: false, authenticated: false })
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("shojuen_sb_access")?.value

  if (!accessToken) {
    return NextResponse.json({ configured: true, authenticated: false })
  }

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return NextResponse.json({ configured: true, authenticated: false }, { status: 401 })
  }

  const user = await response.json()

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
    return NextResponse.json({ configured: true, authenticated: false }, { status: 403 })
  }

  const rows = await membership.json()
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ configured: true, authenticated: false }, { status: 403 })
  }

  return NextResponse.json({
    configured: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: rows[0].role,
      displayName: rows[0].display_name,
    },
  })
}
