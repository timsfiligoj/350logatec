// Sentinel Hub Catalog API — STAC-compliant search for cloud-free Sentinel-2
// L2A scenes covering our AOI. We use this as a lookup step so we can record
// a stable scene_id in space_acquisitions; the actual pixels are pulled
// separately by process.ts using the matched scene's date.

import type { Bbox } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const CATALOG_ENDPOINT =
  'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search'
const DEFAULT_SEARCH_WINDOW_DAYS = 30

export type CatalogScene = {
  sceneId: string
  capturedAt: string // ISO 8601 from STAC properties.datetime
  cloudCoverPct: number
}

type StacFeature = {
  id: string
  properties: {
    datetime: string
    'eo:cloud_cover'?: number
  }
}

type StacFeatureCollection = {
  features: StacFeature[]
}

function formatIsoSecond(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z'
}

function monthBounds(month: string): { from: Date; to: Date } {
  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthNum = Number(monthStr)
  if (!Number.isFinite(year) || !Number.isFinite(monthNum)) {
    throw new Error(`Invalid month: ${month} (expected YYYY-MM)`)
  }
  return {
    from: new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0)),
    to: new Date(Date.UTC(year, monthNum, 0, 23, 59, 59)),
  }
}

export async function findCloudFreeScene(args: {
  bbox: Bbox
  maxCloudCoverPct: number
  // If specified, restrict the search to that calendar month (YYYY-MM) and
  // pick the lowest-cloud scene. Otherwise sweep the last 30 days and pick
  // the most recent that meets the cloud filter.
  month?: string
}): Promise<CatalogScene | null> {
  const token = await getCdseAccessToken()

  const { from, to } = args.month
    ? monthBounds(args.month)
    : {
        from: new Date(
          Date.now() - DEFAULT_SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000,
        ),
        to: new Date(),
      }

  // Sentinel Hub Catalog v1.0.0 does not implement the STAC sortby
  // extension, so we over-fetch and pick client-side.
  const body = {
    bbox: args.bbox,
    datetime: `${formatIsoSecond(from)}/${formatIsoSecond(to)}`,
    collections: ['sentinel-2-l2a'],
    limit: 50,
    'filter-lang': 'cql2-json',
    filter: {
      op: '<=',
      args: [{ property: 'eo:cloud_cover' }, args.maxCloudCoverPct],
    },
  }

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
    throw new Error(
      `CDSE Catalog search failed: ${response.status} ${response.statusText}${
        detail ? ` — ${detail}` : ''
      }`,
    )
  }

  const data = (await response.json()) as StacFeatureCollection
  if (data.features.length === 0) return null

  // Within a fixed calendar month we want the cleanest scene; for the
  // latest-month sweep we want the most recent that already passed the
  // cloud filter.
  const pick = args.month
    ? data.features.reduce((best, candidate) => {
        const bestCC = best.properties['eo:cloud_cover'] ?? 100
        const candidateCC = candidate.properties['eo:cloud_cover'] ?? 100
        return candidateCC < bestCC ? candidate : best
      })
    : data.features.reduce((best, candidate) =>
        candidate.properties.datetime > best.properties.datetime
          ? candidate
          : best,
      )

  return {
    sceneId: pick.id,
    capturedAt: pick.properties.datetime,
    cloudCoverPct: pick.properties['eo:cloud_cover'] ?? 0,
  }
}

/**
 * Back-compat shim for callers that only need the latest cloud-free scene.
 * @deprecated use {@link findCloudFreeScene} with the explicit args object.
 */
export async function findLatestCloudFreeScene(
  bbox: Bbox,
  maxCloudCoverPct: number,
): Promise<CatalogScene | null> {
  return findCloudFreeScene({ bbox, maxCloudCoverPct })
}
