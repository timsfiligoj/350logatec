// Area of interest for 350space. Final WGS84 bounding box (Logatec + Planinsko
// polje) is determined manually before Phase 2 against the municipal boundary
// and the karst polje extent — intentionally left null here so Phase 1 cannot
// silently bake in a guess.

export type Bbox = readonly [
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
]

export const LOGATEC_AOI: Bbox | null = null
