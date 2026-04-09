"use client"

import { motion } from "framer-motion"

/** ヒーロー周辺の静かな浮遊感（装飾） */
export function FloatingOrbs() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -left-[12%] top-[18%] h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl"
        animate={{ y: [0, -18, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[8%] bottom-[12%] h-96 w-96 rounded-full bg-emerald-900/20 blur-3xl"
        animate={{ y: [0, 22, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}
