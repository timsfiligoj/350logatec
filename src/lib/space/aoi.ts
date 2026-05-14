// Area of interest for 350space. WGS84 bounding box centred on Logatec
// town + Hotedršica + Planinsko polje. Trimmed from the earlier ~460 km²
// envelope after seeing the first true-color render — the previous extent
// wasted pixels on Vrhnika and the surrounding hills that aren't part of
// the project's narrative. At Sentinel-2 native 10 m resolution this is
// about 1400 x 1780 pixels.

export type Bbox = readonly [
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
]

export const LOGATEC_AOI: Bbox = [14.13, 45.79, 14.31, 45.95] as const

// Pixel size at native S2 resolution. Computed against the bbox above;
// do not edit independently of LOGATEC_AOI.
export const LOGATEC_AOI_PIXELS = {
  width: 1400,
  height: 1780,
} as const

// Tighter sub-region used only for the "% Planinskega polja pod vodo"
// metric. Visualisations still cover the full LOGATEC_AOI; only the NDWI
// water-percentage statistic is computed over this rectangle to avoid
// confounding from non-polje water bodies (rivers, ponds) inside the AOI.
export const PLANINSKO_POLJE_BBOX: Bbox = [14.21, 45.8, 14.3, 45.84] as const
