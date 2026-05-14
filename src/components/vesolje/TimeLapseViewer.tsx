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
import { Badge } from '@/components/ui/badge'
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

  // Drive autoplay forward; wrap around at the end so the loop never stalls.
  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, frames.length])

  // Preload every frame on mount so playback doesn't flash blank while the
  // browser fetches a fresh source URL. The HEAD requests cache the images
  // so future <Image src=...> swaps render instantly.
  useEffect(() => {
    const preloaded: HTMLImageElement[] = []
    for (const frame of frames) {
      const img = new window.Image()
      img.src = frame.publicUrl
      preloaded.push(img)
    }
    return () => {
      // Allow GC to release them when the viewer unmounts.
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
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:gap-6">
      <figure className="relative overflow-hidden rounded-2xl border bg-muted flex flex-col max-h-[58vh] md:max-h-[68vh]">
        <div className="relative w-full bg-black/5 flex-1 min-h-0">
          <Image
            key={current.publicUrl}
            src={current.publicUrl}
            alt={`Logatec, ${current.capturedAt.slice(0, 10)}`}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain"
            priority
            unoptimized
          />
          {actions ? (
            <div className="absolute top-3 right-3 z-10">{actions}</div>
          ) : null}
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {formatSlovenianMonth(current.capturedAt)}
            </span>
            <span className="text-xs hidden sm:inline">
              ({new Date(current.capturedAt).toISOString().slice(0, 10)})
            </span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Cloud className="h-3 w-3" />
            {current.cloudCoverPct.toFixed(1)}% oblačnost
          </Badge>
        </figcaption>
      </figure>

      <div className="rounded-2xl border bg-card p-4 md:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            Predvajanje
          </span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {frames.length}
          </span>
        </div>

        <Button
          size="lg"
          onClick={() => setPlaying((p) => !p)}
          disabled={!canStep}
          className="gap-2 w-full"
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4" /> Ustavi
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Predvajaj
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || !canStep}
            aria-label="Prejšnja scena"
            className="shrink-0"
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
              'flex-1 h-2 rounded-full appearance-none cursor-pointer bg-muted',
              'accent-emerald-500',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab',
            )}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setIndex((i) => Math.min(frames.length - 1, i + 1))
            }
            disabled={index === frames.length - 1 || !canStep}
            aria-label="Naslednja scena"
            className="shrink-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatSlovenianMonth(frames[0].capturedAt)}</span>
          <span>
            {formatSlovenianMonth(frames[frames.length - 1].capturedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
