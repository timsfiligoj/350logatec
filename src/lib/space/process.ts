// Sentinel Hub Process API — renders pixels for the AOI using a given
// evalscript. Returns raw PNG bytes. The caller is responsible for storing or
// further processing them.

import { type Bbox, LOGATEC_AOI_PIXELS } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const PROCESS_ENDPOINT = 'https://sh.dataspace.copernicus.eu/api/v1/process'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'

function toDayWindow(isoTimestamp: string): { from: string; to: string } {
  const day = isoTimestamp.slice(0, 10) // YYYY-MM-DD
  return {
    from: `${day}T00:00:00Z`,
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
  const timeRange = toDayWindow(args.capturedAt)

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
