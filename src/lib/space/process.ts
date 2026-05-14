// Sentinel Hub Process API — renders pixels for the AOI using a given
// evalscript. Returns raw PNG bytes. The caller is responsible for storing or
// further processing them.

import { type Bbox, LOGATEC_AOI_PIXELS } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const PROCESS_ENDPOINT = 'https://sh.dataspace.copernicus.eu/api/v1/process'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'

// A Sentinel-2 scene covers a single ~100x100 km UTM tile, which often only
// partially overlaps a small AOI like Logatec's. Asking the Process API for
// just the catalog match's day usually yields black no-data fill across the
// missing tiles. Widening to a multi-day window lets the leastCC mosaicker
// stitch coverage from adjacent passes. Sentinel-2 revisit at this latitude
// is 3–5 days, so a 10-day window reliably covers the AOI.
const MOSAIC_WINDOW_DAYS = 10

function toMosaicWindow(isoTimestamp: string): { from: string; to: string } {
  const to = new Date(isoTimestamp)
  const from = new Date(to.getTime() - MOSAIC_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const day = to.toISOString().slice(0, 10)
  return {
    from: `${from.toISOString().slice(0, 10)}T00:00:00Z`,
    to: `${day}T23:59:59Z`,
  }
}

export async function fetchSceneAsPng(args: {
  bbox: Bbox
  capturedAt: string
  maxCloudCoverPct: number
  evalscript: string
}): Promise<Buffer> {
  const token = await getCdseAccessToken()
  const timeRange = toMosaicWindow(args.capturedAt)

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
