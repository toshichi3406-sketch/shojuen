import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

export const runtime = "nodejs"
const bucket = "workboard-private"
const maxBytes = 3 * 1024 * 1024
const formats: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

function matchesFormat(ext: string, bytes: Uint8Array) {
  const starts = (values: number[]) => values.every((value, index) => bytes[index] === value)
  if (ext === "pdf") return starts([37, 80, 68, 70, 45])
  if (ext === "png") return starts([137, 80, 78, 71, 13, 10, 26, 10])
  if (ext === "jpg" || ext === "jpeg") return starts([255, 216, 255])
  if (ext === "webp") return starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((value, index) => bytes[index + 8] === value)
  return (ext === "docx" || ext === "xlsx") && starts([80, 75, 3, 4])
}

function privatePath(path: string) {
  return /^products\/[A-Za-z0-9_-]{1,64}\/[0-9a-f-]{36}\.(pdf|png|jpe?g|webp|docx|xlsx)$/.test(path)
}

async function context() {
  const token = (await cookies()).get("shojuen_sb_access")?.value
  if (!token) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("資料保存の接続設定がありません。")
  return { url, headers: { apikey: key, Authorization: `Bearer ${token}` } }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await context()
    if (!ctx) return NextResponse.json({ error: "ログインしてください。" }, { status: 401 })
    const declaredLength = Number(request.headers.get("content-length") || 0)
    if (declaredLength > maxBytes + 128 * 1024) return NextResponse.json({ error: "ファイルは3MB以下にしてください。" }, { status: 413 })
    const form = await request.formData()
    const productId = String(form.get("productId") || "")
    const file = form.get("file")
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(productId) || !(file instanceof File)) {
      return NextResponse.json({ error: "商品とファイルを確認してください。" }, { status: 400 })
    }
    if (!file.size || file.size > maxBytes) return NextResponse.json({ error: "空のファイルは添付できません。ファイルは3MB以下にしてください。" }, { status: 413 })
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    if (!formats[ext]) return NextResponse.json({ error: "PDF・PNG・JPEG・WebP・DOCX・XLSXを選択してください。" }, { status: 400 })
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!matchesFormat(ext, bytes)) return NextResponse.json({ error: "ファイルの形式と拡張子が一致しません。" }, { status: 400 })
    const products = await fetch(`${ctx.url}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=id`, { headers: ctx.headers, cache: "no-store" })
    if (!products.ok || !(await products.json()).length) return NextResponse.json({ error: "商品を先に保存するか、アクセス権を確認してください。" }, { status: 403 })
    const id = randomUUID()
    const path = `products/${productId}/${id}.${ext}`
    const encodedPath = path.split("/").map(encodeURIComponent).join("/")
    const stored = await fetch(`${ctx.url}/storage/v1/object/${bucket}/${encodedPath}`, {
      method: "POST", headers: { ...ctx.headers, "Content-Type": formats[ext], "x-upsert": "false" },
      body: new Blob([bytes], { type: formats[ext] }), cache: "no-store",
    })
    if (!stored.ok) return NextResponse.json({ error: "非公開ファイルを保存できませんでした。保存先の設定・権限・空き容量を確認してください。" }, { status: 502 })
    const title = file.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200) || `資料.${ext}`
    const record = await fetch(`${ctx.url}/rest/v1/product_documents`, {
      method: "POST", headers: { ...ctx.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ id, product_id: productId, title, storage_path: path, mime_type: formats[ext] }),
      cache: "no-store",
    })
    if (!record.ok) {
      await fetch(`${ctx.url}/storage/v1/object/${bucket}`, {
        method: "DELETE", headers: { ...ctx.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [path] }), cache: "no-store",
      }).catch(() => {})
      return NextResponse.json({ error: "資料の登録に失敗しました。商品を開き直してからお試しください。" }, { status: 502 })
    }
    return NextResponse.json({ doc: { id, title, url: path, mimeType: formats[ext], isPrivate: true } }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "ファイルの保存に失敗しました。再度ログインしてお試しください。" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await context()
    if (!ctx) return NextResponse.json({ error: "ログインしてください。" }, { status: 401 })
    const id = request.nextUrl.searchParams.get("id") || ""
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "資料IDが不正です。" }, { status: 400 })
    const result = await fetch(`${ctx.url}/rest/v1/product_documents?id=eq.${encodeURIComponent(id)}&select=id,title,storage_path`, { headers: ctx.headers, cache: "no-store" })
    if (!result.ok) return NextResponse.json({ error: "資料を閲覧する権限を確認してください。" }, { status: 403 })
    const doc = (await result.json())[0]
    if (!doc || !privatePath(doc.storage_path)) return NextResponse.json({ error: "資料が見つかりません。" }, { status: 404 })
    const encodedPath = doc.storage_path.split("/").map(encodeURIComponent).join("/")
    const file = await fetch(`${ctx.url}/storage/v1/object/authenticated/${bucket}/${encodedPath}`, { headers: ctx.headers, cache: "no-store" })
    if (!file.ok) return NextResponse.json({ error: "ファイルを取得できませんでした。" }, { status: file.status === 403 ? 403 : 404 })
    const filename = encodeURIComponent(String(doc.title || "document").replace(/[\u0000-\u001f\u007f]/g, "")).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    return new Response(file.body, { headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="document"; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } })
  } catch {
    return NextResponse.json({ error: "資料の取得に失敗しました。再度ログインしてお試しください。" }, { status: 500 })
  }
}
