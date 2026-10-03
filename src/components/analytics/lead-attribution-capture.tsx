"use client"

import { useEffect } from "react"

import { captureLeadAttribution } from "@/lib/lead-tracking"

export function LeadAttributionCapture() {
  useEffect(() => {
    captureLeadAttribution()
  }, [])

  return null
}
