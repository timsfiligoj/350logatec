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
 * Readiness is driven by the viewer calling `markDecoded(url)` from
 * each `<Image>`'s onLoad, so we track the same optimized AVIF that
 * the browser actually displays — preloading the raw Supabase PNG
 * via `new Image()` would just waste bandwidth on a different URL.
 * Play unlocks as soon as the visible frame is decoded; during
 * playback the timer holds the current frame (with `buffering=true`)
 * until the next is ready, so users never see a half-rendered PNG.
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

  function markDecoded(url: string) {
    if (decodedRef.current.has(url)) return
    decodedRef.current.add(url)
    forceTick((t) => t + 1)
  }

  return {
    frames,
    index,
    current,
    playing,
    ready,
    buffering,
    canStep,
    markDecoded,
    setIndex,
    togglePlay: () => setPlaying((p) => !p),
    stop: () => setPlaying(false),
    stepBack: () => setIndex((i) => Math.max(0, i - 1)),
    stepForward: () => setIndex((i) => Math.min(frames.length - 1, i + 1)),
  }
}
