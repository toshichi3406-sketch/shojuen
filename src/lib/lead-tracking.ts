"use client"

import { track } from "@vercel/analytics"

export type LeadAttribution = {
  landingPath: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

const STORAGE_KEY = "shojuen_lead_attribution_v1"

function clean(value: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, 120)
}

export function captureLeadAttribution(): void {
  if (typeof window === "undefined") return

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const params = new URLSearchParams(window.location.search)
    const attribution: LeadAttribution = {
      landingPath: window.location.pathname,
      utmSource: clean(params.get("utm_source")),
      utmMedium: clean(params.get("utm_medium")),
      utmCampaign: clean(params.get("utm_campaign")),
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    /* Attribution is optional; never block the inquiry flow. */
  }
}

export function getLeadAttribution(): LeadAttribution | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<LeadAttribution>
    if (typeof parsed.landingPath !== "string") return null

    return {
      landingPath: parsed.landingPath,
      utmSource: clean(parsed.utmSource ?? null),
      utmMedium: clean(parsed.utmMedium ?? null),
      utmCampaign: clean(parsed.utmCampaign ?? null),
    }
  } catch {
    return null
  }
}

export function trackLeadEvent(
  name: string,
  data: { location: string; locale: string }
): void {
  try {
    track(name, data)
  } catch {
    /* Analytics must never interrupt navigation or inquiry actions. */
  }
}
