'use client'

import { useEffect, useRef, useState } from 'react'

const FRAME_INTERVAL_MS = 900

export type TimeLapseFrame = {
  publicUrl: string
  capturedAt: string
  cloudCoverPct: number
  metrics?: Record<string, number> | null
}

/**
 * Shared autoplay + slider state for the various timelapse viewers.
 * Preloads frames in parallel and decodes the initial (latest) one
 * first so Play unlocks as soon as that single frame is ready —
 * waiting on all ~24 PNGs would otherwise take 20+ seconds on mobile.
 * During playback, the tick advances only to already-decoded frames
 * and pauses at the current one (with `buffering=true`) until the
 * next is ready, so the user never sees a half-rendered PNG.
 */
export function useTimeLapse(frames: TimeLapseFrame[]) {
  const [index, setIndex] = useState(Math.max(0, frames.length - 1))
  const [playing, setPlaying] = useState(false)
  const [, forceTick] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const decodedRef = useRef<Set<string>>(new Set())
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    decodedRef.current = new Set()
    forceTick((t) => t + 1)
    if (frames.length === 0) return
    let cancelled = false
    const preloaded: HTMLImageElement[] = []
    const initial = frames.length - 1
    const order = [
      initial,
      ...frames.map((_, i) => i).filter((i) => i !== initial),
    ]
    for (const i of order) {
      const frame = frames[i]
      const img = new window.Image()
      img.src = frame.publicUrl
      preloaded.push(img)
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return
          decodedRef.current.add(frame.publicUrl)
          forceTick((t) => t + 1)
        })
    }
    return () => {
      cancelled = true
      preloaded.length = 0
    }
  }, [frames])

  useEffect(() => {
    if (!playing || frames.length < 2) return
    timer.current = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % frames.length
        const nextUrl = frames[next]?.publicUrl
        if (nextUrl && decodedRef.current.has(nextUrl)) {
          setBuffering(false)
          return next
        }
        setBuffering(true)
        return i
      })
    }, FRAME_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, frames])

  useEffect(() => {
    if (!playing) setBuffering(false)
  }, [playing])

  const current = frames[index] ?? null
  const ready = current ? decodedRef.current.has(current.publicUrl) : false
  const canStep = frames.length > 1 && ready

  return {
    frames,
    index,
    current,
    playing,
    ready,
    buffering,
    canStep,
    setIndex,
    togglePlay: () => setPlaying((p) => !p),
    stop: () => setPlaying(false),
    stepBack: () => setIndex((i) => Math.max(0, i - 1)),
    stepForward: () => setIndex((i) => Math.min(frames.length - 1, i + 1)),
  }
}
