// Sentinel Hub Statistical API — server-side aggregation over an AOI.
// Returns mean / stdev plus an optional uniform-width histogram, which
// lets us compute headline metrics (% under water, mean NDVI, etc.) without
// having to download the raster ourselves.
//
// Docs: https://docs.sentinel-hub.com/api/latest/api/statistical/

import type { Bbox } from './aoi'
import { getCdseAccessToken } from './cdse-auth'

const STATISTICS_ENDPOINT =
  'https://sh.dataspace.copernicus.eu/api/v1/statistics'
const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326'
// resx/resy for EPSG:4326 bounds are in DEGREES per pixel, not metres. At
// Logatec's latitude 0.001° lon ≈ 78 m and 0.001° lat ≈ 111 m, which gives
// us ~180×160 sample points across the AOI — more than enough for
// accurate fraction-above-threshold metrics and orders of magnitude
// cheaper in processing-units than asking for the native 10 m raster.
const STATISTICAL_RES_DEG = 0.001

export type IndexId = 'ndwi' | 'ndvi' | 'ndsi'

export type HistogramSpec = {
  // Uniform-width bins are the only ones Sentinel Hub accepts for FLOAT32
  // outputs; specify the width and the full edge range.
  binWidth: number
  lowEdge: number
  highEdge: number
}

export type IndexStatistics = {
  mean: number
  stDev: number
  min: number
  max: number
  // When a histogram was requested: pixel count per bin in ascending edge
  // order. Empty array when no histogram was requested or the response
  // omitted it.
  histogramCounts: number[]
  // Bin edges aligned with histogramCounts (length = histogramCounts + 1).
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
  // Omit to request only mean/min/max/stDev without a histogram.
  histogram?: HistogramSpec
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

  // Sentinel Hub Statistical API rejects integer-typed histogram params
  // when paired with a FLOAT32 evalscript output. JavaScript can't
  // distinguish 1 from 1.0 in JSON output, so we nudge each numeric edge
  // by a sub-significand epsilon — JSON.stringify then writes a decimal
  // and the API accepts the histogram as float-typed. The shift is
  // ~12 orders of magnitude below our bin width, so metric outputs are
  // unaffected.
  const FLOAT_EPSILON = 1e-9
  const calculations: Record<string, unknown> = {
    [args.indexId]: {
      statistics: { default: {} },
      ...(args.histogram
        ? {
            histograms: {
              default: {
                binWidth: args.histogram.binWidth + FLOAT_EPSILON,
                lowEdge: args.histogram.lowEdge + FLOAT_EPSILON,
                highEdge: args.histogram.highEdge + FLOAT_EPSILON,
              },
            },
          }
        : {}),
    },
  }

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
      resx: STATISTICAL_RES_DEG,
      resy: STATISTICAL_RES_DEG,
    },
    calculations,
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
    : []

  return {
    mean: stats.mean,
    stDev: stats.stDev,
    min: stats.min,
    max: stats.max,
    histogramCounts,
    histogramEdges,
  }
}
