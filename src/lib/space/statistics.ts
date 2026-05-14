// Sentinel Hub Statistical API — server-side aggregation over an AOI.
// Returns mean / stdev / percentiles / histograms in a single call, which
// lets us compute headline metrics (% under water, mean NDVI, etc.) without
// having to download the raster ourselves.
//
// Docs: https://docs.sentinel-hub.com/api/latest/api/statistical/

import type { Bbox } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const STATISTICS_ENDPOINT =
  'https://sh.dataspace.copernicus.eu/api/v1/statistics'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'
const NATIVE_RES_M = 10

export type IndexId = 'ndwi' | 'ndvi' | 'ndsi'

export type IndexStatistics = {
  mean: number
  stDev: number
  min: number
  max: number
  // Pixel counts in the requested histogram bins, in bin-edge order.
  histogramCounts: number[]
  histogramEdges: number[]
}

type StatisticalApiResponse = {
  data: Array<{
    outputs: Record<
      string,
      {
        bands: Record<
          string,
          {
            stats: {
              mean: number
              stDev: number
              min: number
              max: number
              sampleCount: number
              noDataCount: number
            }
            histogram?: {
              bins: Array<{
                lowEdge: number
                highEdge: number
                count: number
              }>
            }
          }
        >
      }
    >
  }>
}

export async function fetchIndexStatistics(args: {
  bbox: Bbox
  // Calendar-month window like 2024-08; statistical aggregation will cover
  // the whole month.
  month: string
  indexId: IndexId
  evalscript: string
  maxCloudCoverPct: number
  histogramEdges: readonly number[] // length N+1 for N bins
}): Promise<IndexStatistics | null> {
  const token = await getCdseAccessToken()

  const [yearStr, monthStr] = args.month.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error(`Invalid month: ${args.month} (expected YYYY-MM)`)
  }
  // First day of given month (inclusive) to first day of next month (exclusive).
  const fromDate = new Date(Date.UTC(year, month - 1, 1))
  const toDate = new Date(Date.UTC(year, month, 1))
  // Sentinel Hub Statistical API expects `to` to be strictly after `from`
  // and applies the interval per-day; using next-month-start is fine.

  const nBins = args.histogramEdges.length - 1
  const lowEdge = args.histogramEdges[0]
  const highEdge = args.histogramEdges[args.histogramEdges.length - 1]

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
            maxCloudCoverage: args.maxCloudCoverPct,
            mosaickingOrder: 'leastCC',
          },
        },
      ],
    },
    aggregation: {
      timeRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      aggregationInterval: { of: 'P1M' },
      evalscript: args.evalscript,
      resx: NATIVE_RES_M,
      resy: NATIVE_RES_M,
    },
    calculations: {
      [args.indexId]: {
        statistics: { default: {} },
        histograms: {
          default: {
            nBins,
            lowEdge,
            highEdge,
          },
        },
      },
    },
  }

  const response = await fetch(STATISTICS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `CDSE Statistical API failed: ${response.status} ${response.statusText}${
        detail ? ` — ${detail}` : ''
      }`,
    )
  }

  const json = (await response.json()) as StatisticalApiResponse
  const interval = json.data[0]
  if (!interval) return null

  const output = interval.outputs[args.indexId]
  const band = output?.bands.B0
  if (!band) return null

  const stats = band.stats
  const bins = band.histogram?.bins ?? []
  const histogramCounts = bins.map((b) => b.count)
  const histogramEdges = bins.length
    ? [...bins.map((b) => b.lowEdge), bins[bins.length - 1].highEdge]
    : [...args.histogramEdges]

  return {
    mean: stats.mean,
    stDev: stats.stDev,
    min: stats.min,
    max: stats.max,
    histogramCounts,
    histogramEdges,
  }
}
