'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  CalendarDays,
  Cloud,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SI_MONTHS = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
] as const

const FRAME_INTERVAL_MS = 900

export type Frame = {
  publicUrl: string
  capturedAt: string
  cloudCoverPct: number
}

function formatSlovenianMonth(iso: string): string {
  const [year, monthStr] = iso.slice(0, 7).split('-')
  return `${SI_MONTHS[Number(monthStr) - 1]} ${year}`
}

export function TimeLapseViewer({
  frames,
  actions,
}: {
  frames: Frame[]
  actions?: React.ReactNode
}) {
  const [index, setIndex] = useState(frames.length - 1)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, frames.length])

  // Preload every frame on mount so playback never flashes blank.
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

  if (frames.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Za časovni pregled potrebujemo vsaj eno sceno. Vrni se po prvi
        akviziciji.
      </p>
    )
  }

  const current = frames[index]
  const canStep = frames.length > 1

  return (
    <figure className="relative mx-auto overflow-hidden rounded-2xl border bg-muted aspect-[1400/1780] max-h-[75vh] w-full max-w-full">
      <Image
        key={current.publicUrl}
        src={current.publicUrl}
        alt={`Logatec, ${current.capturedAt.slice(0, 10)}`}
        fill
        sizes="(max-width: 768px) 100vw, 700px"
        className="object-contain bg-black/5"
        priority
        unoptimized
      />

      <div className="absolute top-3 inset-x-3 z-10 flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {formatSlovenianMonth(current.capturedAt)}
          </span>
          <span className="inline-flex items-center gap-1 opacity-80 border-l border-white/30 pl-2">
            <Cloud className="h-3 w-3" />
            {current.cloudCoverPct.toFixed(1)}%
          </span>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 bg-black/65 backdrop-blur-sm text-white">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            onClick={() => setPlaying((p) => !p)}
            disabled={!canStep}
            size="sm"
            className="gap-1.5 bg-white text-foreground hover:bg-white/90 shrink-0"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Ustavi
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Predvajaj
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || !canStep}
            aria-label="Prejšnja scena"
            className="text-white hover:bg-white/15 hover:text-white h-8 w-8 shrink-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={index}
            onChange={(e) => {
              setPlaying(false)
              setIndex(Number(e.target.value))
            }}
            disabled={!canStep}
            className={cn(
              'flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-white/25',
              'accent-emerald-400',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab',
              '[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab',
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setIndex((i) => Math.min(frames.length - 1, i + 1))
            }
            disabled={index === frames.length - 1 || !canStep}
            aria-label="Naslednja scena"
            className="text-white hover:bg-white/15 hover:text-white h-8 w-8 shrink-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <span className="text-xs tabular-nums opacity-85 shrink-0 min-w-[3.5rem] text-right">
            {index + 1} / {frames.length}
          </span>
        </div>
      </div>
    </figure>
  )
}
