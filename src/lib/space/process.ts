// Sentinel Hub Process API — renders pixels for the AOI using a given
// evalscript. Returns raw PNG bytes. The caller chooses the evalscript
// (true color, NDWI viz, NDVI viz, NDSI viz, etc.).

import { type Bbox, LOGATEC_AOI_PIXELS } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const PROCESS_ENDPOINT = 'https://sh.dataspace.copernicus.eu/api/v1/process'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'

// Sentinel-2 covers each location every ~3-5 days at our latitude, so a
// 10-day window is wide enough to mosaic across a small AOI that spans
// multiple UTM tiles. Used only when we don't already have a calendar
// month constraint from the caller.
const MOSAIC_WINDOW_DAYS = 10

function mosaicWindowAroundScene(isoTimestamp: string): {
  from: string
  to: string
} {
  const to = new Date(isoTimestamp)
  const from = new Date(to.getTime() - MOSAIC_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

function monthWindow(month: string): { from: string; to: string } {
  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthNum = Number(monthStr)
  if (!Number.isFinite(year) || !Number.isFinite(monthNum)) {
    throw new Error(`Invalid month: ${month} (expected YYYY-MM)`)
  }
  return {
    from: new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0)).toISOString(),
    to: new Date(Date.UTC(year, monthNum, 0, 23, 59, 59)).toISOString(),
  }
}

export async function fetchSceneAsPng(args: {
  bbox: Bbox
  // If `month` is provided (YYYY-MM), the Process API mosaics across the
  // whole month with leastCC ordering. Otherwise we use a ±N-day window
  // around `capturedAt` to fill tile gaps.
  capturedAt: string
  month?: string
  maxCloudCoverPct: number
  evalscript: string
}): Promise<Buffer> {
  const token = await getCdseAccessToken()
  const timeRange = args.month
    ? monthWindow(args.month)
    : mosaicWindowAroundScene(args.capturedAt)

  const body = {
    input: {
      bounds: {
        bbox: args.bbox,
        properties: { crs: WGS84_CRS },
      },
      data: [
        {
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange,
            maxCloudCoverage: args.maxCloudCoverPct,
            mosaickingOrder: 'leastCC',
          },
        },
      ],
    },
    output: {
      width: LOGATEC_AOI_PIXELS.width,
      height: LOGATEC_AOI_PIXELS.height,
      responses: [
        {
          identifier: 'default',
          format: { type: 'image/png' },
        },
      ],
    },
    evalscript: args.evalscript,
  }

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
    throw new Error(
      `CDSE Process API failed: ${response.status} ${response.statusText}${
        detail ? ` — ${detail}` : ''
      }`,
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
