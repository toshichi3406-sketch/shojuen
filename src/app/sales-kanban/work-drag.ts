"use client"

import { useEffect, useRef } from "react"

export function createWorkDragController(callbacks: {
  onLift: () => void
  onDrop: (id: string, status: string) => void
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
      const previousOpacity = card.style.opacity
      const board = card.closest<HTMLElement>("[data-work-board]")
      function mark(next: HTMLElement | null) {
        if (next === column) return
        column?.removeAttribute("data-work-drag-over")
        column = next
        column?.setAttribute("data-work-drag-over", "true")
      }
      function finish() {
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
          callbacks.onLift()
          const rect = card.getBoundingClientRect()
          ghost = card.cloneNode(true) as HTMLElement
          ghost.removeAttribute("id")
          Object.assign(ghost.style, { position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, margin: "0", zIndex: "10000", pointerEvents: "none", transition: "none", opacity: "0.95", boxShadow: "0 16px 40px #0008" })
          ghost.setAttribute("aria-hidden", "true")
          document.body.appendChild(ghost)
          card.style.opacity = "0.35"
        }
        if (ghost) ghost.style.transform = `translate(${e.clientX - x}px, ${e.clientY - y}px)`
        if (board) {
          const rect = board.getBoundingClientRect()
          if (e.clientX > rect.right - 48) board.scrollLeft += 24
          else if (e.clientX < rect.left + 48) board.scrollLeft -= 24
        }
        mark(document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-work-column]") ?? null)
      }
      function up(e: PointerEvent) {
        if (e.pointerId !== pointerId) return
        const target = lifted ? document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-work-column]") : null
        const status = target?.dataset.workColumn
        const wasLifted = lifted
        finish()
        if (wasLifted && status) callbacks.onDrop(id, status)
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
    onLift: () => latest.current.onLift(),
    onDrop: (id, status) => latest.current.onDrop(id, status),
    onFinish: (lifted) => latest.current.onFinish(lifted),
  })
  useEffect(() => () => controller.current?.dispose(), [])
  return controller.current
}
