import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set("shojuen_sb_access", "", { path: "/", maxAge: 0 })
  response.cookies.set("shojuen_sb_refresh", "", { path: "/", maxAge: 0 })
  return response
}
