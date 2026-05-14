// Sentinel Hub Catalog API — STAC-compliant search for the most recent
// cloud-free Sentinel-2 L2A scene covering our AOI. We use this as a lookup
// step so we can record a stable scene_id in space_acquisitions; the actual
// pixels are pulled separately by process.ts using the matched scene's date.

import type { Bbox } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const CATALOG_ENDPOINT =
  'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search'
const SEARCH_WINDOW_DAYS = 30

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

function formatIsoDay(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z'
}

export async function findLatestCloudFreeScene(
  bbox: Bbox,
  maxCloudCoverPct: number,
): Promise<CatalogScene | null> {
  const token = await getCdseAccessToken()

  const to = new Date()
  const from = new Date(to.getTime() - SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const body = {
    bbox,
    datetime: `${formatIsoDay(from)}/${formatIsoDay(to)}`,
    collections: ['sentinel-2-l2a'],
    limit: 1,
    'filter-lang': 'cql2-json',
    filter: {
      op: '<=',
      args: [{ property: 'eo:cloud_cover' }, maxCloudCoverPct],
    },
    sortby: [{ field: 'properties.datetime', direction: 'desc' }],
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
  const feature = data.features[0]
  if (!feature) return null

  return {
    sceneId: feature.id,
    capturedAt: feature.properties.datetime,
    cloudCoverPct: feature.properties['eo:cloud_cover'] ?? 0,
  }
}
