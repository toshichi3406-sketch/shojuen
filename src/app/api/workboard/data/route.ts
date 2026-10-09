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
    sales_case_id: item.salesCaseId || null,
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
    const [products, customers, prices, workItems, links, docs, events, shippingRates, productCosts, salesCases, salesCaseProducts, orders, orderItems] = await Promise.all([
      sb("products?select=*&order=id.asc", token),
      sb("customers?select=*&order=id.asc", token),
      sb("customer_prices_current?select=*", token),
      sb("work_items?select=*&order=created_at.asc", token),
      sb("work_item_products?select=*", token),
      sb("product_documents?select=*", token),
      sb("work_events?select=*&order=event_date.desc", token),
      sb("shipping_rates?select=*&order=created_at.desc", token),
      sb("product_costs?select=*&order=created_at.desc", token),
      sb("sales_cases?select=*&order=created_at.desc", token),
      sb("sales_case_products?select=*", token),
      sb("orders?select=*&order=order_date.desc,created_at.desc", token),
      sb("order_items?select=*&order=created_at.asc", token),
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
      salesCaseId: e.sales_case_id || undefined,
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

    const mappedProductCosts = (productCosts || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      costType: r.cost_type,
      label: r.label || "",
      amount: r.amount == null ? "" : String(r.amount),
      currency: r.currency || "JPY",
      unit: r.unit || "kg",
      quantityBasis: r.quantity_basis == null ? "" : String(r.quantity_basis),
      effectiveFrom: r.effective_from || "",
      effectiveTo: r.effective_to || "",
      supplierOrVendor: r.supplier_or_vendor || "",
      note: r.note || "",
      createdAt: r.created_at,
    }))

    const mappedShippingRates = (shippingRates || []).map((r: any) => ({
      id: r.id,
      rateStage: r.rate_stage || "",
      origin: r.origin || "",
      destination: r.destination || "",
      carrier: r.carrier || "",
      service: r.service || "",
      weightFromKg: r.weight_from_kg == null ? "" : String(r.weight_from_kg),
      weightToKg: r.weight_to_kg == null ? "" : String(r.weight_to_kg),
      actualWeightKg: r.actual_weight_kg == null ? "" : String(r.actual_weight_kg),
      sizeClass: r.size_class || "",
      price: r.price == null ? "" : String(r.price),
      currency: r.currency || "JPY",
      transitTime: r.transit_time || "",
      terms: r.terms || "",
      source: r.source || "",
      verifiedAt: r.verified_at || "",
      shipmentDate: r.shipment_date || "",
      customerId: r.customer_id || "",
      note: r.note || "",
      createdAt: r.created_at,
    }))

    const mappedSalesCases = (salesCases || []).map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      title: row.title,
      theme: row.theme,
      caseType: row.case_type,
      stage: row.stage,
      heat: row.heat,
      nextFollowUpDate: row.next_follow_up_date || "",
      nextAction: row.next_action || "",
      assignee: row.assignee || "",
      lastContactAt: row.last_contact_at || "",
      closeReason: row.close_reason || "",
      closeNote: row.close_note || "",
      wonAt: row.won_at || "",
      closedAt: row.closed_at || "",
      productIds: (salesCaseProducts || [])
        .filter((link: any) => link.sales_case_id === row.id)
        .map((link: any) => link.product_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const mappedOrders = (orders || []).map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      salesCaseId: row.sales_case_id || "",
      orderType: row.order_type,
      orderStatus: row.order_status,
      orderDate: row.order_date,
      currency: row.currency || "JPY",
      shippingAmount: row.shipping_amount == null ? "" : String(row.shipping_amount),
      totalAmount: row.total_amount == null ? "" : String(row.total_amount),
      externalOrderRef: row.external_order_ref || "",
      note: row.note || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: (orderItems || [])
        .filter((item: any) => item.order_id === row.id)
        .map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity == null ? "" : String(item.quantity),
          unit: item.unit || "kg",
          unitPrice: item.unit_price == null ? "" : String(item.unit_price),
          lineAmount: item.line_amount == null ? "" : String(item.line_amount),
        })),
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
      salesCaseId: w.sales_case_id || "",
      productIds: (links || [])
        .filter((l: any) => l.work_item_id === w.id)
        .map((l: any) => l.product_id),
    }))

    return NextResponse.json({
      work: mappedWork,
      customers: mappedCustomers,
      products: mappedProducts,
      events: mappedEvents,
      shippingRates: mappedShippingRates,
      productCosts: mappedProductCosts,
      salesCases: mappedSalesCases,
      orders: mappedOrders,
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
    } else if (type === "sales_case") {
      if (!data.customerId || !data.title || !data.theme || !data.caseType || !data.stage || !data.heat || !data.assignee) {
        return NextResponse.json({ error: "営業案件の必須項目を確認してください。" }, { status: 400 })
      }

      const payload = {
        customer_id: data.customerId,
        title: data.title,
        theme: data.theme,
        case_type: data.caseType,
        stage: data.stage,
        heat: data.heat,
        next_follow_up_date: data.nextFollowUpDate || null,
        next_action: data.nextAction || null,
        assignee: data.assignee,
        last_contact_at: data.lastContactAt || null,
        close_reason: data.closeReason || null,
        close_note: data.closeNote || null,
        won_at: data.wonAt || null,
        closed_at: data.closedAt || null,
        updated_at: new Date().toISOString(),
      }

      let salesCaseId = data.id
      if (salesCaseId) {
        await sb(`sales_cases?id=eq.${encodeURIComponent(salesCaseId)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        })
      } else {
        const inserted = await sb("sales_cases", token, {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        })
        salesCaseId = inserted?.[0]?.id
      }

      if (!salesCaseId) {
        return NextResponse.json({ error: "営業案件IDを取得できませんでした。" }, { status: 500 })
      }

      await sb(`sales_case_products?sales_case_id=eq.${encodeURIComponent(salesCaseId)}`, token, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      })

      if ((data.productIds || []).length) {
        await sb("sales_case_products", token, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(
            data.productIds.map((productId: string) => ({
              sales_case_id: salesCaseId,
              product_id: productId,
            }))
          ),
        })
      }

      return NextResponse.json({ ok: true, id: salesCaseId })
    } else if (type === "order") {
      if (!data.customerId || !data.orderDate || !data.orderType || !data.orderStatus || !data.currency) {
        return NextResponse.json({ error: "受注履歴の必須項目を確認してください。" }, { status: 400 })
      }

      const items = Array.isArray(data.items) ? data.items : []
      if (!items.length) {
        return NextResponse.json({ error: "受注明細を1件以上追加してください。" }, { status: 400 })
      }

      const normalizedItems = items.map((item: any) => {
        const quantity = Number(String(item.quantity ?? "").replace(/,/g, ""))
        const unitPrice = Number(String(item.unitPrice ?? "").replace(/[,s¥￥]/g, ""))
        if (!item.productId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new Error("受注明細の商品・数量・単価を確認してください。")
        }
        return {
          product_id: item.productId,
          quantity,
          unit: item.unit || "kg",
          unit_price: unitPrice,
          line_amount: quantity * unitPrice,
        }
      })

      const computedSubtotal = normalizedItems.reduce((sum: number, item: any) => sum + item.line_amount, 0)
      const shippingAmount = data.shippingAmount === "" || data.shippingAmount == null
        ? null
        : Number(String(data.shippingAmount).replace(/[,s¥￥]/g, ""))

      if (shippingAmount != null && (!Number.isFinite(shippingAmount) || shippingAmount < 0)) {
        return NextResponse.json({ error: "送料を確認してください。" }, { status: 400 })
      }

      const payload = {
        customer_id: data.customerId,
        sales_case_id: data.salesCaseId || null,
        order_type: data.orderType,
        order_status: data.orderStatus,
        order_date: data.orderDate,
        currency: data.currency || "JPY",
        shipping_amount: shippingAmount,
        total_amount: computedSubtotal + (shippingAmount || 0),
        external_order_ref: data.externalOrderRef || null,
        note: data.note || null,
        updated_at: new Date().toISOString(),
      }

      let orderId = data.id
      if (orderId) {
        await sb(`orders?id=eq.${encodeURIComponent(orderId)}`, token, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        })
      } else {
        const inserted = await sb("orders", token, {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        })
        orderId = inserted?.[0]?.id
      }

      if (!orderId) {
        return NextResponse.json({ error: "受注IDを取得できませんでした。" }, { status: 500 })
      }

      await sb(`order_items?order_id=eq.${encodeURIComponent(orderId)}`, token, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      })

      await sb("order_items", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(
          normalizedItems.map((item: any) => ({
            ...item,
            order_id: orderId,
          }))
        ),
      })

      return NextResponse.json({ ok: true, id: orderId, totalAmount: payload.total_amount })
    } else if (type === "work_event") {
      await sb("work_events", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          work_item_id: data.workItemId || null,
          sales_case_id: data.salesCaseId || null,
          event_type: data.eventType || "note",
          event_date: data.eventDate || new Date().toISOString(),
          channel: data.channel || null,
          note: data.note || null,
          direction: data.direction || null,
          source: data.source || "manual",
        }),
      })
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
    } else if (type === "product_cost") {
      const amount = Number(String(data.amount ?? "").replace(/[,\s¥￥]/g, ""))
      if (!data.productId || !data.costType || !data.label || !Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "原価の必須項目を確認してください。" }, { status: 400 })
      }
      await sb("product_costs", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          product_id: data.productId,
          cost_type: data.costType,
          label: data.label,
          amount,
          currency: data.currency || "JPY",
          unit: data.unit || "kg",
          quantity_basis: data.quantityBasis ? Number(data.quantityBasis) : null,
          effective_from: data.effectiveFrom || new Date().toISOString().slice(0, 10),
          supplier_or_vendor: data.supplierOrVendor || null,
          note: data.note || null,
          ai_locked: true,
          approved_at: new Date().toISOString(),
        }),
      })
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
      type === "sales_case" ? "sales_cases" :
      type === "order" ? "orders" :
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
