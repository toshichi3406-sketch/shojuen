"use client"

import { useEffect, useRef } from "react"

export function createWorkDragController(callbacks: {
  onLift: (eventTime: number) => void
  onDrop: (id: string, status: string, eventTime: number) => void
  onFinish: (lifted: boolean) => void
}) {
  let cancel: (() => void) | null = null
  return {
    begin(event: PointerEvent, card: HTMLElement, id: string) {
      if (event.button !== 0 || event.pointerType === "touch") return
      cancel?.()
      const x = event.clientX, y = event.clientY, pointerId = event.pointerId
      let lifted = false
      let ghost: HTMLElement | null = null
      let column: HTMLElement | null = null
      let hitX = NaN, hitY = NaN
      let nextX = x, nextY = y
      let frame = 0
      const previousOpacity = card.style.opacity
      const board = card.closest<HTMLElement>("[data-work-board]")
      function mark(next: HTMLElement | null) {
        if (next === column) return
        column?.removeAttribute("data-work-drag-over")
        column = next
        column?.setAttribute("data-work-drag-over", "true")
      }
      function finish() {
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        window.removeEventListener("pointercancel", abort)
        window.removeEventListener("blur", abort)
        window.removeEventListener("keydown", key)
        ghost?.remove()
        card.style.opacity = previousOpacity
        mark(null)
        cancel = null
        callbacks.onFinish(lifted)
      }
      function move(e: PointerEvent) {
        if (e.pointerId !== pointerId) return
        if (!lifted && Math.hypot(e.clientX - x, e.clientY - y) < 6) return
        e.preventDefault()
        if (!lifted) {
          lifted = true
          callbacks.onLift(e.timeStamp)
          const rect = card.getBoundingClientRect()
          ghost = card.cloneNode(true) as HTMLElement
          ghost.removeAttribute("id")
          Object.assign(ghost.style, { position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, margin: "0", zIndex: "10000", pointerEvents: "none", transition: "none", opacity: "0.95", boxShadow: "0 16px 40px #0008" })
          ghost.setAttribute("aria-hidden", "true")
          document.body.appendChild(ghost)
          card.style.opacity = "0.35"
        }
        nextX = e.clientX
        nextY = e.clientY
        if (!frame) frame = window.requestAnimationFrame(paint)
      }
      function paint() {
        frame = 0
        // Coalesce pointer events; read the target before writing the ghost's styles.
        mark(document.elementFromPoint(nextX, nextY)?.closest<HTMLElement>("[data-work-column]") ?? null)
        hitX = nextX
        hitY = nextY
        const rect = board?.getBoundingClientRect()
        if (ghost) ghost.style.transform = `translate(${nextX - x}px, ${nextY - y}px)`
        if (board && rect) {
          const before = board.scrollLeft
          if (nextX > rect.right - 48) board.scrollLeft += 24
          else if (nextX < rect.left + 48) board.scrollLeft -= 24
          if (board.scrollLeft !== before) hitX = NaN
        }
      }
      function up(e: PointerEvent) {
        if (e.pointerId !== pointerId) return
        const target = lifted ? (e.clientX === hitX && e.clientY === hitY ? column : document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-work-column]")) : null
        const status = target?.dataset.workColumn
        const wasLifted = lifted
        try {
          // Play placement feedback before DOM cleanup or the save starts rendering.
          if (wasLifted && status) callbacks.onDrop(id, status, e.timeStamp)
        } finally { finish() }
      }
      function abort(e?: PointerEvent | Event) {
        if (e && "pointerId" in e && e.pointerId !== pointerId) return
        finish()
      }
      function key(e: KeyboardEvent) { if (e.key === "Escape") { e.preventDefault(); finish() } }
      cancel = finish
      window.addEventListener("pointermove", move, { passive: false })
      window.addEventListener("pointerup", up)
      window.addEventListener("pointercancel", abort)
      window.addEventListener("blur", abort)
      window.addEventListener("keydown", key)
    },
    dispose() { cancel?.() },
  }
}

export function useWorkDrag(callbacks: Parameters<typeof createWorkDragController>[0]) {
  const latest = useRef(callbacks)
  latest.current = callbacks
  const controller = useRef<ReturnType<typeof createWorkDragController> | null>(null)
  if (!controller.current) controller.current = createWorkDragController({
    onLift: (eventTime) => latest.current.onLift(eventTime),
    onDrop: (id, status, eventTime) => latest.current.onDrop(id, status, eventTime),
    onFinish: (lifted) => latest.current.onFinish(lifted),
  })
  useEffect(() => () => controller.current?.dispose(), [])
  return controller.current
}
