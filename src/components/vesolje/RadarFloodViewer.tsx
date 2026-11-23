'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { CalendarDays, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describeFloodKm2, formatKm2 } from '@/lib/space/describe'
import { useTimeLapse, type TimeLapseFrame } from './useTimeLapse'
import { ControlsOverlay } from './TimeLapseViewer'

export type RadarViewerFrame = {
  publicUrl: string
  capturedAt: string
  waterKm2: number
}

const SI_MONTHS = [
  'januar', 'februar', 'marec', 'april', 'maj', 'junij',
  'julij', 'avgust', 'september', 'oktober', 'november', 'december',
] as const

const SI_MONTHS_SHORT = [
  'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.',
  'jul.', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.',
] as const

function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d}. ${SI_MONTHS[m - 1]} ${y}`
}

function formatMonthShort(iso: string): string {
  return `${SI_MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
}

// Radar gives ~150 frames a year; mounting every <Image> at once (as the
// monthly viewers do) would download all of them. Only the current frame
// and a couple of neighbours are mounted, which is enough for autoplay:
// useTimeLapse waits on the next frame's decode before advancing.
const PRELOAD_BEHIND = 1
const PRELOAD_AHEAD = 3

export function RadarFloodViewer({
  frames,
  actions,
}: {
  frames: RadarViewerFrame[]
  actions?: React.ReactNode
}) {
  const tlFrames: TimeLapseFrame[] = useMemo(
    () =>
      frames.map((f) => ({
        publicUrl: f.publicUrl,
        capturedAt: f.capturedAt,
        cloudCoverPct: 0,
        metrics: { water_km2: f.waterKm2 },
      })),
    [frames],
  )
  const tl = useTimeLapse(tlFrames)
  const maxKm2 = Math.max(1, ...frames.map((f) => f.waterKm2))

  if (!tl.current) return null
  const current = frames[tl.index]

  const mounted = frames
    .map((frame, i) => ({ frame, i }))
    .filter(({ i }) => {
      const ahead = (i - tl.index + frames.length) % frames.length
      return i === tl.index || (i < tl.index && tl.index - i <= PRELOAD_BEHIND) || ahead <= PRELOAD_AHEAD
    })

  return (
    <div>
      <figure className="relative mx-auto overflow-hidden rounded-2xl border bg-muted aspect-[1090/1000] max-h-[75vh] w-full">
        {mounted.map(({ frame, i }) => {
          const isActive = i === tl.index
          return (
            <Image
              key={frame.publicUrl}
              src={frame.publicUrl}
              alt={`Planinsko polje z radarja, ${formatDay(frame.capturedAt)}: pod vodo ${formatKm2(frame.waterKm2)} km²`}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className={cn('object-contain', isActive ? 'z-[1]' : 'z-0')}
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

        <div className="absolute top-3 inset-x-3 z-10 flex items-start justify-between gap-3 pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1.5 text-xs text-white pointer-events-auto">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">{formatDay(current.capturedAt)}</span>
          </div>
          {actions ? <div className="pointer-events-auto">{actions}</div> : null}
        </div>

        {/* Bottom-right: the flood spreads over the left and centre of the
            frame, the lower right is hills (Laze), so nothing is hidden. */}
        <div className="absolute bottom-16 right-3 z-10 max-w-[9.5rem] md:max-w-[13rem] rounded-xl bg-black/65 backdrop-blur-sm px-2.5 py-1.5 md:px-3 md:py-2 text-white pointer-events-none text-right">
          <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight font-semibold">
            Pod vodo
          </p>
          <p className="mt-0.5 font-display font-bold leading-none">
            <span className="text-xl md:text-2xl tabular-nums">{formatKm2(current.waterKm2)}</span>
            <span className="text-base font-semibold opacity-80 ml-1">km²</span>
          </p>
          <p className="mt-1 text-[11px] opacity-90 leading-tight">
            {describeFloodKm2(current.waterKm2)}
          </p>
        </div>

        <ControlsOverlay {...tl} />
      </figure>

      <div className="mt-3 rounded-2xl border bg-card px-3 pt-3 pb-2">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Waves className="h-3.5 w-3.5 text-blue-600" />
          Voda na polju po dnevih. Klikni stolpec za tisti dan.
        </p>
        <div className="flex items-end gap-px h-16" role="group" aria-label="Površina vode po dnevih">
          {frames.map((f, i) => (
            <button
              key={f.publicUrl}
              type="button"
              onClick={() => {
                tl.stop()
                tl.setIndex(i)
              }}
              aria-label={`${formatDay(f.capturedAt)}: ${formatKm2(f.waterKm2)} km²`}
              aria-pressed={i === tl.index}
              title={`${formatDay(f.capturedAt)}: ${formatKm2(f.waterKm2)} km²`}
              className="flex-1 min-w-0 h-full flex items-end cursor-pointer group"
            >
              <span
                className={cn(
                  'block w-full rounded-t-[1px] transition-colors',
                  i === tl.index ? 'bg-emerald-500' : 'bg-blue-500/70 group-hover:bg-blue-600',
                )}
                style={{ height: `${Math.max(3, (f.waterKm2 / maxKm2) * 100)}%` }}
              />
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{formatMonthShort(frames[0].capturedAt)}</span>
          <span>{formatMonthShort(frames[frames.length - 1].capturedAt)}</span>
        </div>
      </div>
    </div>
  )
}
