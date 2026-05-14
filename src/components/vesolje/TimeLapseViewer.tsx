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

  // Drive autoplay forward; wrap around at the end so the loop never
  // stalls.
  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, frames.length])

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
    <div className="flex flex-col gap-4">
      <figure className="relative overflow-hidden rounded-2xl border bg-muted flex flex-col">
        <div className="relative w-full bg-black/5 flex-1 min-h-0 max-h-[58vh] md:max-h-[68vh] aspect-[1400/1780]">
          <Image
            key={current.publicUrl}
            src={current.publicUrl}
            alt={`Logatec, ${current.capturedAt.slice(0, 10)}`}
            fill
            sizes="(max-width: 768px) 100vw, 1000px"
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

      <div className="rounded-2xl border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => setPlaying((p) => !p)}
            disabled={!canStep}
            className="gap-2 min-w-[110px]"
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || !canStep}
            aria-label="Prejšnja scena"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setIndex((i) => Math.min(frames.length - 1, i + 1))
            }
            disabled={index === frames.length - 1 || !canStep}
            aria-label="Naslednja scena"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="ml-auto text-sm text-muted-foreground tabular-nums">
            {index + 1} / {frames.length}
          </div>
        </div>

        <div className="mt-4">
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
              'w-full h-2 rounded-full appearance-none cursor-pointer bg-muted',
              'accent-emerald-500',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab',
            )}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{formatSlovenianMonth(frames[0].capturedAt)}</span>
            <span>
              {formatSlovenianMonth(frames[frames.length - 1].capturedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
