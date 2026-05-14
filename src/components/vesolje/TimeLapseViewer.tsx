'use client'

import Image from 'next/image'
import {
  CalendarDays,
  Cloud,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTimeLapse, type TimeLapseFrame } from './useTimeLapse'

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

function formatSlovenianMonth(iso: string): string {
  const [year, monthStr] = iso.slice(0, 7).split('-')
  return `${SI_MONTHS[Number(monthStr) - 1]} ${year}`
}

export function TimeLapseViewer({
  frames,
  actions,
}: {
  frames: TimeLapseFrame[]
  actions?: React.ReactNode
}) {
  const tl = useTimeLapse(frames)
  if (!tl.current) {
    return (
      <p className="text-muted-foreground text-sm">
        Za časovni pregled potrebujemo vsaj eno sceno. Vrni se po prvi
        akviziciji.
      </p>
    )
  }

  return (
    <figure className="relative mx-auto overflow-hidden rounded-2xl border bg-muted aspect-[1400/1780] max-h-[75vh] w-full max-w-full">
      {tl.frames.map((frame, i) => {
        const isActive = i === tl.index
        return (
          <Image
            key={frame.publicUrl}
            src={frame.publicUrl}
            alt={`Logatec, ${frame.capturedAt.slice(0, 10)}`}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className={cn(
              'object-contain bg-black/5 transition-opacity duration-200',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            {...(isActive ? { priority: true } : { loading: 'eager' })}
            onLoad={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img
                .decode()
                .catch(() => undefined)
                .then(() => tl.markDecoded(frame.publicUrl))
            }}
          />
        )
      })}
      <DateActionsOverlay
        capturedAt={tl.current.capturedAt}
        actions={actions}
      />
      <CloudWarningBanner cloudCoverPct={tl.current.cloudCoverPct} />
      <ControlsOverlay {...tl} />
    </figure>
  )
}

/**
 * Citizen-facing nudge that the current scene was captured under heavy
 * cloud cover, so grey/soft patches in the image aren't a data bug —
 * they're cloud occlusion that the leastCC mosaicker couldn't fully
 * clean. Threshold (50 %) chosen so it only surfaces on noticeably
 * cloudy scenes; NDVI/NDWI captures are filtered well below that.
 */
export function CloudWarningBanner({
  cloudCoverPct,
}: {
  cloudCoverPct: number
}) {
  if (cloudCoverPct <= 50) return null
  return (
    <div className="absolute bottom-12 inset-x-0 z-10 bg-amber-600/90 text-white">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] md:text-xs leading-tight">
        <Cloud className="h-3.5 w-3.5 shrink-0" />
        <span>Oblačno. Sivi predeli so oblaki, ne tla.</span>
      </div>
    </div>
  )
}

export function DateActionsOverlay({
  capturedAt,
  actions,
}: {
  capturedAt: string
  actions?: React.ReactNode
}) {
  return (
    <div className="absolute top-3 inset-x-3 z-10 flex items-start justify-between gap-3 pointer-events-none">
      <div className="inline-flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1.5 text-xs text-white pointer-events-auto">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">{formatSlovenianMonth(capturedAt)}</span>
      </div>
      {actions ? <div className="pointer-events-auto">{actions}</div> : null}
    </div>
  )
}

export function ControlsOverlay({
  index,
  frames,
  playing,
  ready,
  buffering,
  canStep,
  togglePlay,
  setIndex,
  stop,
  stepBack,
  stepForward,
}: ReturnType<typeof useTimeLapse>) {
  const showSpinner = !ready || buffering
  return (
    <div className="absolute bottom-0 inset-x-0 z-10 bg-black/65 backdrop-blur-sm text-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <Button
          onClick={togglePlay}
          disabled={!canStep}
          size="icon"
          aria-label={
            !ready
              ? 'Pripravljam'
              : buffering
                ? 'Nalagam naslednjo sceno'
                : playing
                  ? 'Ustavi'
                  : 'Predvajaj'
          }
          className="bg-white text-foreground hover:bg-white/90 shrink-0 h-8 w-8 disabled:opacity-100 disabled:bg-white/85"
        >
          {showSpinner ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={stepBack}
          disabled={index === 0 || !canStep}
          aria-label="Prejšnja scena"
          className="text-white hover:bg-white/15 hover:text-white h-8 w-8 shrink-0"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={index}
          onChange={(e) => {
            stop()
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
          onClick={stepForward}
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
  )
}
