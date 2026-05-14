// Orchestrator for one acquisition: catalog lookup → dedupe → process →
// storage upload → statistical metrics → DB row. One entry point per
// view_kind; per-kind specifics (evalscript, metric calculator) are kept
// in this file as configuration so adding a new view_kind stays local.

import { LOGATEC_AOI, PLANINSKO_POLJE_BBOX } from './aoi'
import { findCloudFreeScene } from './catalog'
import { fetchSceneAsPng } from './process'
import { fetchIndexStatistics, type IndexStatistics } from './statistics'
import { TRUE_COLOR_EVALSCRIPT } from './evalscripts/true-color'
import {
  NDWI_EVALSCRIPT,
  NDWI_STATISTICAL_EVALSCRIPT,
} from './evalscripts/ndwi'
import {
  NDVI_EVALSCRIPT,
  NDVI_STATISTICAL_EVALSCRIPT,
} from './evalscripts/ndvi'
import {
  NDSI_EVALSCRIPT,
  NDSI_STATISTICAL_EVALSCRIPT,
} from './evalscripts/ndsi'
import {
  buildStoragePath,
  getPublicUrl,
  uploadPng,
  type ViewKind,
} from './storage'
import { createAdminClient } from '@/lib/supabase/admin'

// Per-view cloud-cover tolerance. Higher thresholds let us cover months
// the catalog would otherwise skip; the Process API's leastCC mosaicker
// still composes the cleanest available pixels from the 10-day window
// around the catalog match, so a 60 % "cloud cover" scene rarely looks
// like 60 % cloud cover in the rendered output.
//
// true_color was tightened originally to keep the hero visual clean, but
// the time-lapse view wants continuous month-by-month coverage and a
// partly-cloudy month is more useful than a missing one, so it tracks
// NDSI at 60 %.
const MAX_CLOUD_COVER_PCT: Record<ViewKind, number> = {
  true_color: 60,
  ndvi: 20,
  ndwi: 40,
  ndsi: 60,
}

export type AcquireOptions = {
  viewKind: ViewKind
  // Optional calendar month (YYYY-MM). If omitted, the latest cloud-free
  // scene over the AOI within the last 30 days is used.
  month?: string
  force: boolean
}

export type AcquireMetrics = Record<string, number>

export type AcquireResult = {
  status: 'acquired' | 'cached'
  scene_id: string
  view_kind: ViewKind
  captured_at: string
  cloud_cover_pct: number
  storage_path: string
  public_url: string
  metrics: AcquireMetrics | null
}

const VIEW_CONFIG: Record<
  ViewKind,
  {
    pngEvalscript: string
    // null = no metrics computed for this view_kind (e.g. true_color).
    statisticalEvalscript: string | null
  }
> = {
  true_color: {
    pngEvalscript: TRUE_COLOR_EVALSCRIPT,
    statisticalEvalscript: null,
  },
  ndwi: {
    pngEvalscript: NDWI_EVALSCRIPT,
    statisticalEvalscript: NDWI_STATISTICAL_EVALSCRIPT,
  },
  ndvi: {
    pngEvalscript: NDVI_EVALSCRIPT,
    statisticalEvalscript: NDVI_STATISTICAL_EVALSCRIPT,
  },
  ndsi: {
    pngEvalscript: NDSI_EVALSCRIPT,
    statisticalEvalscript: NDSI_STATISTICAL_EVALSCRIPT,
  },
}

function pixelsAbove(
  stats: IndexStatistics,
  threshold: number,
): { above: number; total: number } {
  let above = 0
  let total = 0
  for (let i = 0; i < stats.histogramCounts.length; i++) {
    const count = stats.histogramCounts[i]
    total += count
    if (stats.histogramEdges[i] >= threshold) above += count
  }
  return { above, total }
}

async function computeMetrics(
  viewKind: ViewKind,
  month: string,
): Promise<AcquireMetrics | null> {
  const config = VIEW_CONFIG[viewKind]
  if (!config.statisticalEvalscript) return null

  const cloudPct = MAX_CLOUD_COVER_PCT[viewKind]

  if (viewKind === 'ndwi') {
    // Mean MNDWI over full AOI, plus % water inside the Planinsko polje
    // sub-bbox. MNDWI > 0 = water, so a 2-bin histogram (-1 → 0 → 1)
    // gives us land vs. water counts.
    const [aoiStats, poljeStats] = await Promise.all([
      fetchIndexStatistics({
        bbox: LOGATEC_AOI,
        month,
        indexId: 'ndwi',
        evalscript: config.statisticalEvalscript,
        maxCloudCoverPct: cloudPct,
      }),
      fetchIndexStatistics({
        bbox: PLANINSKO_POLJE_BBOX,
        month,
        indexId: 'ndwi',
        evalscript: config.statisticalEvalscript,
        maxCloudCoverPct: cloudPct,
        histogram: { binWidth: 1, lowEdge: -1, highEdge: 1 },
      }),
    ])

    const metrics: AcquireMetrics = {}
    if (aoiStats) metrics.mean = round(aoiStats.mean, 3)
    if (poljeStats) {
      const { above, total } = pixelsAbove(poljeStats, 0)
      metrics.polje_water_pct = total
        ? round((above / total) * 100, 1)
        : 0
    }
    return metrics
  }

  if (viewKind === 'ndvi') {
    // NDVI gets the mean only; peak-greening detection happens at
    // view-time by sorting acquisitions by date.
    const stats = await fetchIndexStatistics({
      bbox: LOGATEC_AOI,
      month,
      indexId: 'ndvi',
      evalscript: config.statisticalEvalscript,
      maxCloudCoverPct: cloudPct,
    })
    if (!stats) return null
    return { mean: round(stats.mean, 3) }
  }

  if (viewKind === 'ndsi') {
    // Mean NDSI plus % AOI under snow (NDSI > 0.4, NASA standard).
    // 0.2-wide uniform bins put the 0.4 boundary exactly on an edge.
    const stats = await fetchIndexStatistics({
      bbox: LOGATEC_AOI,
      month,
      indexId: 'ndsi',
      evalscript: config.statisticalEvalscript,
      maxCloudCoverPct: cloudPct,
      histogram: { binWidth: 0.2, lowEdge: -1, highEdge: 1 },
    })
    if (!stats) return null
    const { above, total } = pixelsAbove(stats, 0.4)
    return {
      mean: round(stats.mean, 3),
      snow_pct: total ? round((above / total) * 100, 1) : 0,
    }
  }

  return null
}

function round(value: number, digits: number): number {
  const m = 10 ** digits
  return Math.round(value * m) / m
}

export async function acquire(opts: AcquireOptions): Promise<AcquireResult> {
  const supabase = createAdminClient()
  const config = VIEW_CONFIG[opts.viewKind]
  const cloudPct = MAX_CLOUD_COVER_PCT[opts.viewKind]

  const scene = await findCloudFreeScene({
    bbox: LOGATEC_AOI,
    maxCloudCoverPct: cloudPct,
    month: opts.month,
  })

  if (!scene) {
    const where = opts.month ? `for ${opts.month}` : 'in the last 30 days'
    throw new Error(
      `No Sentinel-2 scene with cloud cover <= ${cloudPct}% ${where} over the configured AOI.`,
    )
  }

  const storagePath = buildStoragePath(
    opts.viewKind,
    scene.sceneId,
    scene.capturedAt,
  )

  if (!opts.force) {
    const { data: existing } = await supabase
      .from('space_acquisitions')
      .select(
        'scene_id, view_kind, captured_at, cloud_cover_pct, storage_path, metrics',
      )
      .eq('scene_id', scene.sceneId)
      .eq('view_kind', opts.viewKind)
      .maybeSingle()

    if (existing) {
      return {
        status: 'cached',
        scene_id: existing.scene_id,
        view_kind: existing.view_kind,
        captured_at: existing.captured_at,
        cloud_cover_pct: existing.cloud_cover_pct,
        storage_path: existing.storage_path,
        public_url: getPublicUrl(existing.storage_path),
        metrics: existing.metrics,
      }
    }
  }

  const png = await fetchSceneAsPng({
    bbox: LOGATEC_AOI,
    capturedAt: scene.capturedAt,
    month: opts.month,
    maxCloudCoverPct: cloudPct,
    evalscript: config.pngEvalscript,
  })

  // Always upsert: the dedupe check above already short-circuits successful
  // prior runs, so if we reach this point we either (a) want to overwrite
  // (force=true) or (b) are recovering from a partial earlier run where the
  // Storage upload landed but the downstream Statistical API / DB insert
  // failed, leaving an orphan object. In both cases overwrite is correct.
  await uploadPng(storagePath, png, { upsert: true })

  // Metrics need a month context. If the caller didn't pass one, derive it
  // from the matched scene's captured_at so the Statistical API has a
  // bounded time window.
  const metricsMonth = opts.month ?? scene.capturedAt.slice(0, 7)
  const metrics = await computeMetrics(opts.viewKind, metricsMonth)

  const { error: insertError } = await supabase
    .from('space_acquisitions')
    .upsert(
      {
        scene_id: scene.sceneId,
        view_kind: opts.viewKind,
        captured_at: scene.capturedAt,
        cloud_cover_pct: scene.cloudCoverPct,
        bbox: LOGATEC_AOI,
        storage_path: storagePath,
        metrics,
      },
      { onConflict: 'scene_id,view_kind' },
    )

  if (insertError) {
    throw new Error(`space_acquisitions upsert failed: ${insertError.message}`)
  }

  return {
    status: 'acquired',
    scene_id: scene.sceneId,
    view_kind: opts.viewKind,
    captured_at: scene.capturedAt,
    cloud_cover_pct: scene.cloudCoverPct,
    storage_path: storagePath,
    public_url: getPublicUrl(storagePath),
    metrics,
  }
}

/** @deprecated retained only for callers that haven't migrated; use {@link acquire}. */
export async function acquireTrueColor(opts: {
  force: boolean
}): Promise<AcquireResult> {
  return acquire({ viewKind: 'true_color', force: opts.force })
}
