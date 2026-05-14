// Area of interest for 350space. WGS84 bounding box covering Občina Logatec
// plus Planinsko polje. At Sentinel-2 native 10 m resolution this is about
// 2100 x 2200 pixels — within the Sentinel Hub Process API single-request limit.

export type Bbox = readonly [
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
]

export const LOGATEC_AOI: Bbox = [14.13, 45.78, 14.4, 45.98] as const

// Pixel size at native S2 resolution. Used by process.ts when requesting an
// image at full 10 m / pixel. Computed against the bbox above; do not edit
// independently of LOGATEC_AOI.
export const LOGATEC_AOI_PIXELS = {
  width: 2100,
  height: 2200,
} as const
