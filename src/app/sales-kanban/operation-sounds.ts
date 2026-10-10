"use client"

import { useEffect, useRef } from "react"

type OperationSound = "click" | "drag" | "drop" | "saved"
const SOUND_TONES = {
  click: [{ frequency: 720, end: 420, delay: 0, duration: 0.065 }],
  drag: [{ frequency: 480, end: 720, delay: 0, duration: 0.12 }],
  drop: [{ frequency: 560, end: 320, delay: 0, duration: 0.105 }],
  saved: [{ frequency: 1320, end: 1568, delay: 0, duration: 0.065 }],
}

export type SoundTiming = { kind: OperationSound; eventDelayMs: number | null; startupMs: number; state: string }
export type SoundDiagnostics = { state: string; outputMs: number | null; timings: SoundTiming[] }

export function createOperationSoundPlayer() {
  let context: AudioContext | null = null
  let lastClickAt = -Infinity
  const buffers = new Map<OperationSound, AudioBuffer>()
  const active = new Set<AudioBufferSourceNode>()

  let quiet: AudioBufferSourceNode | null = null
  let resuming: Promise<void> | null = null
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const timings: SoundTiming[] = []

  function initialize() {
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
              samples[offset + i] += Math.sin(phase) * (kind === "saved" ? 0.075 : 0.14) * attack * Math.max(0, release)
            }
          }
          buffers.set(kind, buffer)
        }
      }
      // Keep the foreground audio path open between gestures, without audible output.
      if (!quiet) {
        quiet = context.createBufferSource()
        quiet.buffer = context.createBuffer(1, 128, context.sampleRate)
        quiet.loop = true
        quiet.connect(context.destination)
        quiet.start()
      }
    } catch {
      // Audio availability must never interrupt editing or saving.
    }
  }

  function prepare() {
    initialize()
    if (!context || context.state === "running") return
    try {
      const pending = context.resume()
      resuming = pending
      void pending.then(() => { if (resuming === pending) resuming = null }, () => { if (resuming === pending) resuming = null })
    } catch { /* Editing still works if audio cannot resume. */ }
  }

  return {
    initialize,
    prepare,
    diagnostics(): SoundDiagnostics {
      let outputMs: number | null = null
      if (context) {
        const output = context.outputLatency
        if (Number.isFinite(output) && Number.isFinite(context.baseLatency)) outputMs = (context.baseLatency + output) * 1000
      }
      return { state: context?.state || "unavailable", outputMs, timings: timings.slice(-5).map((row) => ({ ...row })) }
    },
    play(kind: OperationSound, eventTime?: number) {
      try {
        prepare()
        const current = context
        const buffer = buffers.get(kind)
        if (!current || current.state === "closed" || !buffer) return
        if (kind === "click") {
          const now = performance.now()
          if (now - lastClickAt < 45) return
          lastClickAt = now
        }
        const now = performance.now()
        const timing: SoundTiming = { kind, eventDelayMs: eventTime === undefined ? null : Math.max(0, now - eventTime), startupMs: 0, state: current.state }
        timings.push(timing)
        if (timings.length > 30) timings.shift()
        const source = current.createBufferSource()
        source.buffer = buffer
        source.connect(current.destination)
        active.add(source)
        source.onended = () => { active.delete(source); source.disconnect() }
        // Start now, not at a captured currentTime that can expire during a busy handler.
        if (current.state === "running") source.start()
        else {
          // Give a brief first-gesture wake-up a chance. Never replay an old gesture.
          const expire = () => {
            active.delete(source)
            source.disconnect()
            timing.state = "expired"
          }
          const timer = setTimeout(() => { timers.delete(timer); expire() }, 120)
          timers.add(timer)
          void resuming?.then(() => {
            clearTimeout(timer)
            timers.delete(timer)
            timing.startupMs = performance.now() - now
            if (context !== current || timing.state === "expired" || timing.startupMs > 120) { expire(); return }
            if (current.state === "running") { source.start(); timing.state = "running" }
            else expire()
          }, () => {
            clearTimeout(timer)
            timers.delete(timer)
            active.delete(source)
            source.disconnect()
            timing.state = "blocked"
          })
        }
      } catch {
        // Audio availability must never interrupt editing or saving.
      }
    },
    dispose() {
      for (const timer of timers) clearTimeout(timer)
      timers.clear()
      resuming = null
      if (quiet) {
        try { quiet.stop() } catch { /* Already stopped. */ }
        quiet.disconnect()
        quiet = null
      }
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
  useEffect(() => {
    player.current?.initialize()
    const wake = () => { player.current?.prepare() }
    document.addEventListener("pointerdown", wake, true)
    document.addEventListener("keydown", wake, true)
    window.addEventListener("focus", wake)
    return () => {
      document.removeEventListener("pointerdown", wake, true)
      document.removeEventListener("keydown", wake, true)
      window.removeEventListener("focus", wake)
      player.current?.dispose()
    }
  }, [])
  return {
    prepareOperationSounds: () => { player.current?.prepare() },
    playOperationSound: (kind: OperationSound, eventTime?: number) => { player.current?.play(kind, eventTime) },
    readSoundDiagnostics: () => player.current!.diagnostics(),
  }
}
