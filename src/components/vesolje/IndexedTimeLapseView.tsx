'use client'

import Image from 'next/image'
import {
  ArrowDown,
  ArrowUp,
  Leaf,
  Droplet,
  Snowflake,
  TrendingUp,
  Waves,
  Mountain,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetricCard, type MetricDelta } from './MetricCard'
import { useTimeLapse, type TimeLapseFrame } from './useTimeLapse'
import { ControlsOverlay, DateActionsOverlay } from './TimeLapseViewer'

const SI_MONTH_NAMES = [
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
]

function siMonthYear(iso: string): string {
  return `${SI_MONTH_NAMES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
}

function describeNdvi(mean: number): string {
  if (mean >= 0.75) return 'zelo gosto rastje'
  if (mean >= 0.6) return 'gosto rastje'
  if (mean >= 0.4) return 'zmerno rastje'
  if (mean >= 0.2) return 'redko rastje'
  return 'pretežno gola tla'
}

function describeWater(pct: number): string {
  if (pct >= 30) return 'velika poplava'
  if (pct >= 10) return 'opazna poplava'
  if (pct >= 3) return 'rob polja namočen'
  if (pct >= 0.5) return 'rečice nad bregovi'
  return 'polje suho'
}

function describeSnow(pct: number): string {
  if (pct >= 50) return 'snežna odeja čez večino občine'
  if (pct >= 20) return 'obsežen sneg, večinoma višine'
  if (pct >= 5) return 'sneg ostaja na hribih'
  if (pct >= 0.5) return 'samo posamezne sledi'
  return 'brez snega'
}

type ViewKind = 'ndvi' | 'ndwi' | 'ndsi'

type CurrentMetricSpec = {
  /** Short label shown on the in-image overlay; max ~20 chars. */
  shortLabel: string
  icon: LucideIcon
  /** The metric value used for the year-over-year delta, if any. */
  metricKey: 'mean' | 'polje_water_pct' | 'snow_pct'
  /** Number of decimal places shown in the delta. */
  decimals: number
  /** Optional unit appended to the delta. */
  unit?: string
  format: (frame: TimeLapseFrame) => {
    value: string
    unit?: string
    /** Plain-language single phrase, e.g. "opazna poplava". */
    phrase: string
  }
}

const CURRENT_METRIC: Record<ViewKind, CurrentMetricSpec> = {
  ndvi: {
    shortLabel: 'Gostota rastja',
    icon: Leaf,
    metricKey: 'mean',
    decimals: 2,
    format: (frame) => {
      const mean = frame.metrics?.mean
      if (typeof mean !== 'number') {
        return { value: '—', phrase: 'brez podatka' }
      }
      return {
        value: mean.toFixed(2),
        phrase: describeNdvi(mean),
      }
    },
  },
  ndwi: {
    shortLabel: 'Pod vodo',
    icon: Droplet,
    metricKey: 'polje_water_pct',
    decimals: 1,
    unit: '%',
    format: (frame) => {
      const pct = frame.metrics?.polje_water_pct
      if (typeof pct !== 'number') {
        return { value: '—', phrase: 'brez podatka' }
      }
      return {
        value: pct.toFixed(1),
        unit: '%',
        phrase: describeWater(pct),
      }
    },
  },
  ndsi: {
    shortLabel: 'Pod snegom',
    icon: Snowflake,
    metricKey: 'snow_pct',
    decimals: 1,
    unit: '%',
    format: (frame) => {
      const pct = frame.metrics?.snow_pct
      if (typeof pct !== 'number') {
        return { value: '—', phrase: 'brez podatka' }
      }
      return {
        value: pct.toFixed(1),
        unit: '%',
        phrase: describeSnow(pct),
      }
    },
  },
}

type PeakDescriptor = {
  /** Pre-formatted display value, e.g. "0.85" or "23.4" */
  value: string
  /** Optional unit appended to value (e.g. "%") */
  unit?: string
  /** Captured-at ISO string of the peak month (for the hint). */
  capturedAt: string
  /** Hint prefix; "{month}" gets replaced with siMonthYear(capturedAt). */
  hintPrefix: string
  /** Override icon for the peak card. */
  icon: 'TrendingUp' | 'Waves' | 'Mountain'
}

const PEAK_ICONS = {
  TrendingUp,
  Waves,
  Mountain,
} as const

export function IndexedTimeLapseView({
  viewKind,
  frames,
  peak,
  actions,
}: {
  viewKind: ViewKind
  frames: TimeLapseFrame[]
  peak: PeakDescriptor | null
  actions?: React.ReactNode
}) {
  const tl = useTimeLapse(frames)
  const metric = CURRENT_METRIC[viewKind]

  if (!tl.current) {
    return (
      <p className="text-muted-foreground text-sm">
        Za to podstran potrebujemo vsaj eno akvizicijo. Vrni se po prvi
        akviziciji.
      </p>
    )
  }

  const cur = metric.format(tl.current)
  const PeakIcon = peak ? PEAK_ICONS[peak.icon] : null

  // Year-over-year delta: same calendar month, one year earlier.
  const currentMonth = tl.current.capturedAt.slice(5, 7)
  const currentYear = Number(tl.current.capturedAt.slice(0, 4))
  const yoyFrame = frames.find(
    (f) =>
      f.capturedAt.slice(5, 7) === currentMonth &&
      Number(f.capturedAt.slice(0, 4)) === currentYear - 1,
  )
  let delta: MetricDelta | null = null
  const cv = tl.current.metrics?.[metric.metricKey]
  const yv = yoyFrame?.metrics?.[metric.metricKey]
  if (typeof cv === 'number' && typeof yv === 'number' && yoyFrame) {
    delta = {
      value: cv - yv,
      label: `vs ${siMonthYear(yoyFrame.capturedAt)}`,
      unit: metric.unit,
      decimals: metric.decimals,
    }
  }

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        peak && 'md:grid-cols-[minmax(0,1fr)_minmax(220px,300px)]',
      )}
    >
      <figure className="relative overflow-hidden rounded-2xl border bg-muted aspect-[1400/1780] max-h-[68vh] w-full">
        <Image
          key={tl.current.publicUrl}
          src={tl.current.publicUrl}
          alt={`${viewKind.toUpperCase()} prikaz, ${tl.current.capturedAt.slice(0, 10)}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain bg-black/5"
          priority
          unoptimized
        />
        <DateActionsOverlay
          capturedAt={tl.current.capturedAt}
          actions={actions}
        />
        <MetricOverlay
          label={metric.shortLabel}
          value={cur.value}
          unit={cur.unit}
          phrase={cur.phrase}
          delta={delta}
        />
        <ControlsOverlay {...tl} />
      </figure>

      {peak && PeakIcon ? (
        <div className="md:self-start">
          <MetricCard
            label="Vrh v podatkih"
            value={peak.value}
            unit={peak.unit}
            hint={`${peak.hintPrefix} ${siMonthYear(peak.capturedAt)}`}
            icon={PeakIcon}
            accent="emerald"
          />
        </div>
      ) : null}
    </div>
  )
}

function MetricOverlay({
  label,
  value,
  unit,
  phrase,
  delta,
}: {
  label: string
  value: string
  unit?: string
  phrase: string
  delta: MetricDelta | null
}) {
  return (
    <div className="absolute top-14 left-3 z-10 max-w-[10rem] md:max-w-[12rem] rounded-xl bg-black/65 backdrop-blur-sm px-3 py-2 text-white pointer-events-none">
      <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight font-semibold">
        {label}
      </p>
      <p className="mt-0.5 font-display font-bold leading-none">
        <span className="text-2xl tabular-nums">{value}</span>
        {unit ? (
          <span className="text-base font-semibold opacity-80 ml-0.5">
            {unit}
          </span>
        ) : null}
      </p>
      {phrase ? (
        <p className="mt-1 text-[11px] opacity-90 leading-tight">{phrase}</p>
      ) : null}
      {delta ? <CompactDelta {...delta} /> : null}
    </div>
  )
}

function CompactDelta({ value, label, unit, decimals }: MetricDelta) {
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus
  const prefix = value > 0 ? '+' : value < 0 ? '−' : ''
  return (
    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
      <Icon className="h-2.5 w-2.5" />
      <span>
        {prefix}
        {Math.abs(value).toFixed(decimals)}
        {unit}
      </span>
      <span className="opacity-70">{label}</span>
    </span>
  )
}
