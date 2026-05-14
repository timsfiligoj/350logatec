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
 * Shared autoplay + slider state for the various timelapse viewers. Caller
 * provides the frame list; the hook returns the current frame plus all the
 * callbacks needed by a control bar. Preloads every frame on mount so
 * playback never flashes blank.
 */
export function useTimeLapse(frames: TimeLapseFrame[]) {
  const [index, setIndex] = useState(Math.max(0, frames.length - 1))
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing || frames.length < 2) return
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, frames.length])

  useEffect(() => {
    const preloaded: HTMLImageElement[] = []
    for (const frame of frames) {
      const img = new window.Image()
      img.src = frame.publicUrl
      preloaded.push(img)
    }
    return () => {
      preloaded.length = 0
    }
  }, [frames])

  const current = frames[index] ?? null
  const canStep = frames.length > 1

  return {
    frames,
    index,
    current,
    playing,
    canStep,
    setIndex,
    togglePlay: () => setPlaying((p) => !p),
    stop: () => setPlaying(false),
    stepBack: () => setIndex((i) => Math.max(0, i - 1)),
    stepForward: () => setIndex((i) => Math.min(frames.length - 1, i + 1)),
  }
}
