"use client"

import { useEffect, useRef, useState } from "react"

type OperationSound = "click" | "drag" | "drop"
const SOUND_KEY = "shojuen-workboard-sound-v1"

export function createOperationSoundPlayer() {
  let context: AudioContext | null = null
  let enabled = true
  let revision = 0
  let lastClickAt = -Infinity
  const active = new Set<OscillatorNode>()

  function stopActive() {
    for (const oscillator of active) {
      try { oscillator.stop() } catch { /* Already stopped. */ }
    }
    active.clear()
  }

  return {
    setEnabled(value: boolean) {
      enabled = value
      revision += 1
      if (!value) stopActive()
    },
    async play(kind: OperationSound) {
      if (!enabled || typeof window === "undefined") return
      const requestedRevision = revision
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) return
        if (!context || context.state === "closed") context = new AudioContextClass()
        const current = context
        if (current.state === "suspended") await current.resume()
        if (!enabled || requestedRevision !== revision || context !== current || current.state !== "running") return
        if (kind === "click") {
          const now = performance.now()
          if (now - lastClickAt < 45) return
          lastClickAt = now
        }
        const tones = kind === "drop"
          ? [{ frequency: 660, end: 660, delay: 0, duration: 0.075 }, { frequency: 990, end: 990, delay: 0.085, duration: 0.09 }]
          : [{ frequency: kind === "drag" ? 480 : 720, end: kind === "drag" ? 620 : 420, delay: 0, duration: kind === "drag" ? 0.065 : 0.04 }]
        for (const tone of tones) {
          const start = current.currentTime + tone.delay
          const oscillator = current.createOscillator()
          const gain = current.createGain()
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(tone.frequency, start)
          oscillator.frequency.exponentialRampToValueAtTime(tone.end, start + tone.duration)
          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(0.035, start + 0.004)
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
      revision += 1
      stopActive()
      const previous = context
      context = null
      if (previous && previous.state !== "closed") void previous.close().catch(() => {})
    },
  }
}

export function useOperationSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const player = useRef<ReturnType<typeof createOperationSoundPlayer> | null>(null)
  const enabled = useRef(true)
  if (!player.current) player.current = createOperationSoundPlayer()

  useEffect(() => {
    try { enabled.current = window.localStorage.getItem(SOUND_KEY) !== "off" } catch { /* Use default. */ }
    setSoundEnabled(enabled.current)
    player.current?.setEnabled(enabled.current)
    return () => { player.current?.dispose() }
  }, [])

  function toggleSound() {
    enabled.current = !enabled.current
    setSoundEnabled(enabled.current)
    player.current?.setEnabled(enabled.current)
    try { window.localStorage.setItem(SOUND_KEY, enabled.current ? "on" : "off") } catch { /* Session setting still works. */ }
    if (enabled.current) void player.current?.play("click")
  }

  return { soundEnabled, toggleSound, playOperationSound: (kind: OperationSound) => { void player.current?.play(kind) } }
}
