'use client'

import Image from 'next/image'
import {
  Leaf,
  Droplet,
  Snowflake,
  TrendingUp,
  Waves,
  Mountain,
  type LucideIcon,
} from 'lucide-react'
import { MetricCard } from './MetricCard'
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
  label: string
  icon: LucideIcon
  accent: 'emerald' | 'blue' | 'amber' | 'slate'
  format: (frame: TimeLapseFrame) => {
    value: string
    unit?: string
    hint: string
  }
}

const CURRENT_METRIC: Record<ViewKind, CurrentMetricSpec> = {
  ndvi: {
    label: 'Mesečno povprečje',
    icon: Leaf,
    accent: 'emerald',
    format: (frame) => {
      const mean = frame.metrics?.mean
      if (typeof mean !== 'number') {
        return { value: '—', hint: 'Brez metrike za to sceno' }
      }
      return {
        value: mean.toFixed(2),
        hint: `Povprečni NDVI — ${describeNdvi(mean)}`,
      }
    },
  },
  ndwi: {
    label: 'Polje pod vodo',
    icon: Droplet,
    accent: 'blue',
    format: (frame) => {
      const pct = frame.metrics?.polje_water_pct
      if (typeof pct !== 'number') {
        return { value: '—', hint: 'Brez metrike za to sceno' }
      }
      return {
        value: pct.toFixed(1),
        unit: '%',
        hint: describeWater(pct),
      }
    },
  },
  ndsi: {
    label: 'Občina pod snegom',
    icon: Snowflake,
    accent: 'slate',
    format: (frame) => {
      const pct = frame.metrics?.snow_pct
      if (typeof pct !== 'number') {
        return { value: '—', hint: 'Brez metrike za to sceno' }
      }
      return {
        value: pct.toFixed(1),
        unit: '%',
        hint: describeSnow(pct),
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

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:gap-6">
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
        <ControlsOverlay {...tl} />
      </figure>

      <div className="flex flex-col gap-4">
        <MetricCard
          label={`${metric.label} · ${siMonthYear(tl.current.capturedAt)}`}
          value={cur.value}
          unit={cur.unit}
          hint={cur.hint}
          icon={metric.icon}
          accent={metric.accent}
        />
        {peak && PeakIcon ? (
          <MetricCard
            label="Vrh v podatkih"
            value={peak.value}
            unit={peak.unit}
            hint={`${peak.hintPrefix} ${siMonthYear(peak.capturedAt)}`}
            icon={PeakIcon}
            accent={metric.accent}
          />
        ) : null}
      </div>
    </div>
  )
}
