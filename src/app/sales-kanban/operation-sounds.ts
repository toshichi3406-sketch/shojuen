"use client"

import { useEffect, useRef } from "react"

type OperationSound = "click" | "drag" | "drop" | "saved"
const SOUND_TONES = {
  click: [{ frequency: 720, end: 420, delay: 0, duration: 0.065 }],
  drag: [{ frequency: 480, end: 720, delay: 0, duration: 0.12 }],
  drop: [{ frequency: 660, end: 660, delay: 0, duration: 0.1 }, { frequency: 990, end: 990, delay: 0.05, duration: 0.13 }],
  saved: [{ frequency: 880, end: 1175, delay: 0, duration: 0.09 }, { frequency: 1320, end: 1320, delay: 0.04, duration: 0.12 }],
}

export function createOperationSoundPlayer() {
  let context: AudioContext | null = null
  let lastClickAt = -Infinity
  const buffers = new Map<OperationSound, AudioBuffer>()
  const active = new Set<AudioBufferSourceNode>()

  function prepare() {
    if (typeof window === "undefined") return
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      if (!context || context.state === "closed") {
        context = new AudioContextClass({ latencyHint: "interactive" })
        buffers.clear()
        // Build each sound once, before dragging. Playback needs just one source.start().
        for (const kind of Object.keys(SOUND_TONES) as OperationSound[]) {
          const tones = SOUND_TONES[kind]
          const length = Math.ceil(Math.max(...tones.map((tone) => tone.delay + tone.duration)) * context.sampleRate)
          const buffer = context.createBuffer(1, length, context.sampleRate)
          const samples = buffer.getChannelData(0)
          for (const tone of tones) {
            let phase = 0
            const offset = Math.round(tone.delay * context.sampleRate)
            const count = Math.min(Math.ceil(tone.duration * context.sampleRate), length - offset)
            for (let i = 0; i < count; i++) {
              const t = i / context.sampleRate
              const frequency = tone.frequency * Math.pow(tone.end / tone.frequency, t / tone.duration)
              phase += 2 * Math.PI * frequency / context.sampleRate
              const attack = Math.min(1, t / 0.003)
              const release = Math.min(1, (tone.duration - t) / (tone.duration * 0.65))
              samples[offset + i] += Math.sin(phase) * 0.14 * attack * Math.max(0, release)
            }
          }
          buffers.set(kind, buffer)
        }
      }
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
        const buffer = buffers.get(kind)
        // Never replay a stale gesture when an audio context finishes waking up.
        if (!current || current.state !== "running" || !buffer) return
        if (kind === "click") {
          const now = performance.now()
          if (now - lastClickAt < 45) return
          lastClickAt = now
        }
        const source = current.createBufferSource()
        source.buffer = buffer
        source.connect(current.destination)
        active.add(source)
        source.onended = () => { active.delete(source); source.disconnect() }
        // Start now, not at a captured currentTime that can expire during a busy handler.
        source.start()
      } catch {
        // Audio availability must never interrupt editing or saving.
      }
    },
    dispose() {
      for (const source of active) {
        try { source.stop() } catch { /* Already stopped. */ }
        source.disconnect()
      }
      active.clear()
      buffers.clear()
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
