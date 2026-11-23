// Sentinel-1 radar flood pipeline for /vesolje/planinsko-polje.
//
// One frame per UTC day with a radar pass: catalog lookup → composite PNG
// (radar water mask over a lightened optical base, one Process call with
// data fusion) → class mask PNG (second Process call) → pixel count →
// storage upload → space_acquisitions row with view_kind 's1_water'.
//
// Deliberately independent of the Statistical API: water_km2 is counted
// from the rendered mask, so the number always matches the blue pixels.

import sharp from 'sharp'
import {
  PLANINSKO_POLJE_VIEW_BBOX,
  PLANINSKO_POLJE_VIEW_PIXELS,
} from './aoi'
import { getCdseAccessToken } from './cdse-auth'
import {
  S1_WATER_COMPOSITE_EVALSCRIPT,
  S1_WATER_MASK_EVALSCRIPT,
} from './evalscripts/s1-water'
import { buildStoragePath, getPublicUrl, uploadPng } from './storage'
import { createAdminClient } from '@/lib/supabase/admin'

const CATALOG_ENDPOINT =
  'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search'
const PROCESS_ENDPOINT = 'https://sh.dataspace.copernicus.eu/api/v1/process'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'

export const S1_WATER_KIND = 's1_water' as const

// Clear Sentinel-2 day used as the optical base under every radar frame
// (14 % tile cloud, cloud-free over the polje). A fixed base keeps the
// time-lapse steady: only the blue moves between frames.
const BASE_SCENE_DAY = '2026-10-26'

// Skip passes whose footprint covers less than this share of the frame
// (edge-of-swath slices would otherwise show as half-empty images).
const MIN_COVERAGE = 0.9

const S1_DATA_FILTER = {
  acquisitionMode: 'IW',
  polarization: 'DV',
  resolution: 'HIGH',
} as const

const S1_PROCESSING = {
  backCoeff: 'GAMMA0_TERRAIN',
  orthorectify: true,
  demInstance: 'COPERNICUS',
  speckleFilter: { type: 'LEE', windowSizeX: 5, windowSizeY: 5 },
} as const

export type RadarPassDay = {
  /** UTC calendar day, YYYY-MM-DD */
  day: string
  /** Datetime of the earliest product of that day */
  capturedAt: string
  productIds: string[]
}

export type RadarAcquireResult =
  | {
      status: 'acquired' | 'cached'
      day: string
      captured_at: string
      storage_path: string
      public_url: string
      metrics: { water_km2: number; water_pct: number }
    }
  | { status: 'no_coverage'; day: string; coverage: number }

export function radarSceneId(day: string): string {
  return `S1_WATER_${day}`
}

function nextDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function dayRange(day: string) {
  return { from: `${day}T00:00:00Z`, to: `${nextDay(day)}T00:00:00Z` }
}

/** Area of one output pixel in km², at the frame's centre latitude. */
function pixelAreaKm2(): number {
  const [minLon, minLat, maxLon, maxLat] = PLANINSKO_POLJE_VIEW_BBOX
  const lat = ((minLat + maxLat) / 2) * (Math.PI / 180)
  const pxW = ((maxLon - minLon) / PLANINSKO_POLJE_VIEW_PIXELS.width) * 111.32 * Math.cos(lat)
  const pxH = ((maxLat - minLat) / PLANINSKO_POLJE_VIEW_PIXELS.height) * 110.574
  return pxW * pxH
}

/**
 * All UTC days in [fromDay, toDay] with at least one IW dual-pol GRD
 * product over the view frame. Catalog has no sortby (CDSE quirk #1), so
 * we page through with `next` and group client-side.
 */
export async function listRadarPassDays(
  fromDay: string,
  toDay: string,
): Promise<RadarPassDay[]> {
  const token = await getCdseAccessToken()
  const byDay = new Map<string, RadarPassDay>()
  let next: number | undefined

  for (let page = 0; page < 50; page++) {
    const body: Record<string, unknown> = {
      bbox: PLANINSKO_POLJE_VIEW_BBOX,
      datetime: `${fromDay}T00:00:00Z/${toDay}T23:59:59Z`,
      collections: ['sentinel-1-grd'],
      limit: 100,
    }
    if (next !== undefined) body.next = next

    const response = await fetch(CATALOG_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`CDSE Catalog (S1) failed: ${response.status} ${detail}`)
    }
    const data = (await response.json()) as {
      features: { id: string; properties: { datetime: string } }[]
      context?: { next?: number }
    }

    for (const f of data.features) {
      // Same filter the Process request applies via dataFilter.
      if (!f.id.includes('_IW_GRDH_1SDV_')) continue
      const day = f.properties.datetime.slice(0, 10)
      const entry = byDay.get(day)
      if (!entry) {
        byDay.set(day, { day, capturedAt: f.properties.datetime, productIds: [f.id] })
      } else {
        entry.productIds.push(f.id)
        if (f.properties.datetime < entry.capturedAt) {
          entry.capturedAt = f.properties.datetime
        }
      }
    }

    next = data.context?.next
    if (next === undefined) break
  }

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))
}

async function processPng(body: unknown): Promise<Buffer> {
  const token = await getCdseAccessToken()
  const response = await fetch(PROCESS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'image/png',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`CDSE Process API (S1) failed: ${response.status} ${detail}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function outputSpec() {
  return {
    width: PLANINSKO_POLJE_VIEW_PIXELS.width,
    height: PLANINSKO_POLJE_VIEW_PIXELS.height,
    responses: [{ identifier: 'default', format: { type: 'image/png' } }],
  }
}

function bounds() {
  return { bbox: PLANINSKO_POLJE_VIEW_BBOX, properties: { crs: WGS84_CRS } }
}

async function renderMask(day: string): Promise<Buffer> {
  return processPng({
    input: {
      bounds: bounds(),
      data: [
        {
          type: 'sentinel-1-grd',
          dataFilter: { timeRange: dayRange(day), ...S1_DATA_FILTER },
          processing: S1_PROCESSING,
        },
      ],
    },
    output: outputSpec(),
    evalscript: S1_WATER_MASK_EVALSCRIPT,
  })
}

async function renderComposite(day: string): Promise<Buffer> {
  return processPng({
    input: {
      bounds: bounds(),
      data: [
        {
          id: 's1',
          type: 'sentinel-1-grd',
          dataFilter: { timeRange: dayRange(day), ...S1_DATA_FILTER },
          processing: S1_PROCESSING,
        },
        {
          id: 's2',
          type: 'sentinel-2-l2a',
          dataFilter: { timeRange: dayRange(BASE_SCENE_DAY) },
        },
      ],
    },
    output: outputSpec(),
    evalscript: S1_WATER_COMPOSITE_EVALSCRIPT,
  })
}

async function countMask(png: Buffer) {
  const { data, info } = await sharp(png)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true })
  let valid = 0
  let water = 0
  for (let i = 0; i < data.length; i++) {
    const v = data[i]
    if (v === 0) continue
    valid++
    if (v === 2) water++
  }
  const total = info.width * info.height
  return { coverage: valid / total, water, valid }
}

function round(value: number, digits: number): number {
  const m = 10 ** digits
  return Math.round(value * m) / m
}

/**
 * Render one pass day without touching storage or the DB. Returns png=null
 * when the pass covers too little of the frame.
 */
export async function renderRadarFrame(day: string): Promise<
  | { png: Buffer; coverage: number; metrics: { water_km2: number; water_pct: number } }
  | { png: null; coverage: number }
> {
  // Mask first: it is cheaper than the composite and tells us whether
  // the pass actually covers the frame.
  const mask = await renderMask(day)
  const { coverage, water, valid } = await countMask(mask)
  if (coverage < MIN_COVERAGE) return { png: null, coverage: round(coverage, 3) }

  const metrics = {
    water_km2: round(water * pixelAreaKm2(), 2),
    water_pct: round((water / valid) * 100, 2),
  }
  const png = await renderComposite(day)
  return { png, coverage: round(coverage, 3), metrics }
}

export async function acquireRadarPass(
  pass: RadarPassDay,
  opts: { force: boolean },
): Promise<RadarAcquireResult> {
  const supabase = createAdminClient()
  const sceneId = radarSceneId(pass.day)

  if (!opts.force) {
    const { data: existing } = await supabase
      .from('space_acquisitions')
      .select('captured_at, storage_path, metrics')
      .eq('scene_id', sceneId)
      .eq('view_kind', S1_WATER_KIND)
      .maybeSingle()
    if (existing) {
      return {
        status: 'cached',
        day: pass.day,
        captured_at: existing.captured_at,
        storage_path: existing.storage_path,
        public_url: getPublicUrl(existing.storage_path),
        metrics: existing.metrics,
      }
    }
  }

  const frame = await renderRadarFrame(pass.day)
  if (!frame.png) {
    return { status: 'no_coverage', day: pass.day, coverage: frame.coverage }
  }
  const { png, metrics } = frame
  const storagePath = buildStoragePath(S1_WATER_KIND, sceneId, pass.capturedAt)
  await uploadPng(storagePath, png, { upsert: true })

  const { error } = await supabase.from('space_acquisitions').upsert(
    {
      scene_id: sceneId,
      view_kind: S1_WATER_KIND,
      captured_at: pass.capturedAt,
      cloud_cover_pct: null,
      bbox: PLANINSKO_POLJE_VIEW_BBOX,
      storage_path: storagePath,
      metrics,
    },
    { onConflict: 'scene_id,view_kind' },
  )
  if (error) throw new Error(`space_acquisitions upsert (s1_water) failed: ${error.message}`)

  return {
    status: 'acquired',
    day: pass.day,
    captured_at: pass.capturedAt,
    storage_path: storagePath,
    public_url: getPublicUrl(storagePath),
    metrics,
  }
}

/**
 * Acquire every not-yet-stored pass day in [fromDay, toDay], oldest first,
 * stopping early when the time budget runs out (Vercel functions cap at
 * 60 s; one pass is ~10-15 s). Returns what was done plus the days left.
 */
export async function acquireRadarRange(args: {
  fromDay: string
  toDay: string
  force: boolean
  budgetMs: number
}) {
  const started = Date.now()
  const passes = await listRadarPassDays(args.fromDay, args.toDay)
  const results: RadarAcquireResult[] = []
  const errors: { day: string; error: string }[] = []
  let remaining: string[] = []

  for (let i = 0; i < passes.length; i++) {
    if (Date.now() - started > args.budgetMs) {
      remaining = passes.slice(i).map((p) => p.day)
      break
    }
    try {
      results.push(await acquireRadarPass(passes[i], { force: args.force }))
    } catch (error) {
      errors.push({
        day: passes[i].day,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return { passes: passes.length, results, errors, remaining }
}
