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

function workToDb(item: any) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    customer_id: item.customerId || null,
    work_type: item.workType || null,
    assignee: item.assignee || null,
    priority: item.priority || null,
    due_date: item.dueDate || null,
    next_action: item.nextAction || null,
    country: item.country || null,
    origin_type: item.originType || null,
    channel: item.channel || null,
    memo: item.memo || null,
    updated_at: new Date().toISOString(),
  }
}

function customerToDb(item: any) {
  return {
    id: item.id,
    name: item.name,
    country: item.country || null,
    category: item.category || null,
    contact_name: item.contact || null,
    email: item.email || null,
    phone: item.phone || null,
    instagram: item.instagram || null,
    linkedin: item.linkedin || null,
    note: item.note || null,
    updated_at: new Date().toISOString(),
  }
}

function productToDb(item: any) {
  return {
    id: item.id,
    name: item.name,
    producer: item.producer || null,
    origin: item.origin || null,
    use_case: item.use || null,
    color_note: item.color || null,
    umami_note: item.umami || null,
    bitterness_note: item.bitterness || null,
    aroma_note: item.aroma || null,
    cost: item.cost || null,
    standard_wholesale_price: item.price || null,
    moq: item.moq || null,
    supply_status: item.supply || null,
    memo: item.memo || null,
    updated_at: new Date().toISOString(),
  }
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [products, customers, prices, workItems, links, docs, events] = await Promise.all([
      sb("products?select=*&order=id.asc", token),
      sb("customers?select=*&order=id.asc", token),
      sb("customer_prices_current?select=*", token),
      sb("work_items?select=*&order=created_at.asc", token),
      sb("work_item_products?select=*", token),
      sb("product_documents?select=*", token),
      sb("work_events?select=*&order=event_date.desc", token),
    ])

    const mappedProducts = (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      producer: p.producer || "",
      origin: p.origin || "",
      use: p.use_case || "",
      color: p.color_note || "",
      umami: p.umami_note || "",
      bitterness: p.bitterness_note || "",
      aroma: p.aroma_note || "",
      cost: p.cost || "",
      price: p.standard_wholesale_price || "",
      moq: p.moq || "",
      supply: p.supply_status || "",
      memo: p.memo || "",
      docs: (docs || [])
        .filter((d: any) => d.product_id === p.id)
        .map((d: any) => ({ id: d.id, title: d.title, url: d.storage_path })),
    }))

    const mappedCustomers = (customers || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      country: c.country || "",
      category: c.category || "",
      contact: c.contact_name || "",
      email: c.email || "",
      phone: c.phone || "",
      instagram: c.instagram || "",
      linkedin: c.linkedin || "",
      note: c.note || "",
      prices: (prices || [])
        .filter((p: any) => p.customer_id === c.id && p.is_current)
        .map((p: any) => ({
          id: p.id,
          productId: p.product_id,
          price: p.price == null ? "" : String(p.price),
          currency: p.currency,
          unit: p.unit,
          moq: p.moq || "",
          shipping: p.shipping_terms || "",
          payment: p.payment_terms || "",
          effectiveFrom: p.effective_from || "",
          locked: Boolean(p.ai_locked),
        })),
    }))

    const mappedEvents = (events || []).map((e: any) => ({
      id: e.id,
      workItemId: e.work_item_id || undefined,
      eventType: e.event_type,
      eventDate: e.event_date,
      channel: e.channel || "",
      note: e.note || "",
      counterpartyName: e.counterparty_name || "",
      counterpartyEmail: e.counterparty_email || "",
      direction: e.direction || "",
      source: e.source || "",
      sourceCandidateId: e.source_candidate_id || undefined,
    }))

    const mappedWork = (workItems || []).map((w: any) => ({
      id: w.id,
      title: w.title,
      status: w.status,
      customerId: w.customer_id || undefined,
      workType: w.work_type || "",
      assignee: w.assignee || "",
      priority: w.priority || "中",
      dueDate: w.due_date || "",
      nextAction: w.next_action || "",
      country: w.country || "",
      originType: w.origin_type || undefined,
      channel: w.channel || "",
      memo: w.memo || "",
      productIds: (links || [])
        .filter((l: any) => l.work_item_id === w.id)
        .map((l: any) => l.product_id),
    }))

    return NextResponse.json({
      work: mappedWork,
      customers: mappedCustomers,
      products: mappedProducts,
      events: mappedEvents,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load WORKBOARD data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const type = body?.type
    const data = body?.data
    if (!type || !data) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

    if (type === "work") {
      await sb("work_items?on_conflict=id", token, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(workToDb(data)),
      })
      await sb(`work_item_products?work_item_id=eq.${encodeURIComponent(data.id)}`, token, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      })
      if ((data.productIds || []).length) {
        await sb("work_item_products", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(
            data.productIds.map((productId: string) => ({
              work_item_id: data.id,
              product_id: productId,
              relation_type: "related",
            }))
          ),
        })
      }
    } else if (type === "customer") {
      await sb("customers?on_conflict=id", token, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(customerToDb(data)),
      })
      if ((data.prices || []).length) {
        const currentPrices = await sb(
          `customer_prices_current?select=*&customer_id=eq.${encodeURIComponent(data.id)}`,
          token
        )

        const normalize = (row: any) => ({
          productId: row.product_id ?? row.productId ?? "",
          price: row.price == null || row.price === "" ? null : Number(row.price),
          currency: row.currency || "JPY",
          unit: row.unit || "kg",
          moq: row.moq || null,
          shipping: row.shipping_terms ?? row.shipping ?? null,
          payment: row.payment_terms ?? row.payment ?? null,
          effectiveFrom: row.effective_from ?? row.effectiveFrom ?? null,
        })

        const inserts = (data.prices || [])
          .filter((row: any) => {
            const current = (currentPrices || []).find((p: any) => p.product_id === row.productId)
            if (!current) return true
            const a = normalize(current)
            const b = normalize(row)
            return JSON.stringify(a) !== JSON.stringify(b)
          })
          .map((row: any) => ({
            customer_id: data.id,
            product_id: row.productId,
            price: row.price === "" ? null : Number(row.price),
            currency: row.currency || "JPY",
            unit: row.unit || "kg",
            moq: row.moq || null,
            shipping_terms: row.shipping || null,
            payment_terms: row.payment || null,
            effective_from: row.effectiveFrom || new Date().toISOString().slice(0, 10),
            is_current: true,
            ai_locked: true,
            approved_at: new Date().toISOString(),
          }))

        if (inserts.length) {
          await sb("customer_prices", token, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify(inserts),
          })
        }
      }
    } else if (type === "product") {
      await sb("products?on_conflict=id", token, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(productToDb(data)),
      })
      await sb(`product_documents?product_id=eq.${encodeURIComponent(data.id)}`, token, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      })
      if ((data.docs || []).length) {
        await sb("product_documents", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(
            data.docs
              .filter((doc: any) => doc.title && doc.url)
              .map((doc: any) => ({
                product_id: data.id,
                title: doc.title,
                storage_path: doc.url,
              }))
          ),
        })
      }
    } else {
      return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save WORKBOARD data" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = request.nextUrl.searchParams.get("type")
  const id = request.nextUrl.searchParams.get("id")
  if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 })

  try {
    const table =
      type === "work" ? "work_items" :
      type === "customer" ? "customers" :
      type === "product" ? "products" :
      null

    if (!table) return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 })

    await sb(`${table}?id=eq.${encodeURIComponent(id)}`, token, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete WORKBOARD data" },
      { status: 500 }
    )
  }
}
