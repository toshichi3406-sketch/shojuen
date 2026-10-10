"use client"

import { useEffect, useRef } from "react"

type OperationSound = "click" | "drag" | "drop" | "saved"

export function createOperationSoundPlayer() {
  let context: AudioContext | null = null
  let lastClickAt = -Infinity
  const active = new Set<OscillatorNode>()

  function stopActive() {
    for (const oscillator of active) {
      try { oscillator.stop() } catch { /* Already stopped. */ }
    }
    active.clear()
  }

  function prepare() {
    if (typeof window === "undefined") return
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      if (!context || context.state === "closed") context = new AudioContextClass({ latencyHint: "interactive" })
      if (context.state !== "running") void context.resume().catch(() => {})
    } catch {
      // Audio availability must never interrupt editing or saving.
    }
  }

  return {
    prepare,
    play(kind: OperationSound) {
      try {
        prepare()
        const current = context
        // Prepare on pointer/key down. Never queue a late sound while audio wakes up.
        if (!current || current.state !== "running") return
        if (kind === "click") {
          const now = performance.now()
          if (now - lastClickAt < 45) return
          lastClickAt = now
        }
        const tones = kind === "drop"
          ? [{ frequency: 660, end: 660, delay: 0, duration: 0.075 }, { frequency: 990, end: 990, delay: 0.045, duration: 0.09 }]
          : kind === "saved"
          ? [{ frequency: 880, end: 1175, delay: 0, duration: 0.07 }, { frequency: 1320, end: 1320, delay: 0.035, duration: 0.085 }]
          : [{ frequency: kind === "drag" ? 480 : 720, end: kind === "drag" ? 620 : 420, delay: 0, duration: kind === "drag" ? 0.065 : 0.04 }]
        for (const tone of tones) {
          const start = current.currentTime + tone.delay
          const oscillator = current.createOscillator()
          const gain = current.createGain()
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(tone.frequency, start)
          oscillator.frequency.exponentialRampToValueAtTime(tone.end, start + tone.duration)
          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(0.12, start + 0.003)
          gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration)
          oscillator.connect(gain)
          gain.connect(current.destination)
          active.add(oscillator)
          oscillator.onended = () => { active.delete(oscillator); oscillator.disconnect(); gain.disconnect() }
          oscillator.start(start)
          oscillator.stop(start + tone.duration + 0.01)
        }
      } catch {
        // Audio availability must never interrupt editing or saving.
      }
    },
    dispose() {
      stopActive()
      const previous = context
      context = null
      if (previous && previous.state !== "closed") void previous.close().catch(() => {})
    },
  }
}

export function useOperationSounds() {
  const player = useRef<ReturnType<typeof createOperationSoundPlayer> | null>(null)
  if (!player.current) player.current = createOperationSoundPlayer()

  useEffect(() => () => { player.current?.dispose() }, [])

  return {
    prepareOperationSounds: () => { player.current?.prepare() },
    playOperationSound: (kind: OperationSound) => { player.current?.play(kind) },
  }
}
