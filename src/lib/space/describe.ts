// Plain-language descriptors for the headline metrics on /vesolje
// sub-pages. Kept in a server-agnostic file so server components (pages
// that build the peak descriptor) and the client time-lapse component
// can both import them without crossing the 'use client' boundary.

export function describeNdvi(mean: number): string {
  if (mean >= 0.75) return 'zelo gosto rastje'
  if (mean >= 0.6) return 'gosto rastje'
  if (mean >= 0.4) return 'zmerno rastje'
  if (mean >= 0.2) return 'redko rastje'
  return 'pretežno gola tla'
}

export function describeWater(pct: number): string {
  if (pct >= 30) return 'velika poplava'
  if (pct >= 10) return 'opazna poplava'
  if (pct >= 3) return 'rob polja namočen'
  if (pct >= 0.5) return 'rečice nad bregovi'
  return 'polje suho'
}

export function describeSnow(pct: number): string {
  if (pct >= 50) return 'snežna odeja čez večino občine'
  if (pct >= 20) return 'obsežen sneg, večinoma višine'
  if (pct >= 5) return 'sneg ostaja na hribih'
  if (pct >= 0.5) return 'samo posamezne sledi'
  return 'brez snega'
}

// Radar flood extent over the Planinsko polje frame. The polje floor is
// roughly 10 km²; on dry days the median is ~0.05 km² and rarely above
// 0.4 km² (the Unica and a few ponds), so anything under 0.5 km² reads as
// dry. Backfill 2025-10..2026-11: peaks 1.7 (Nov 2025), 2.2 (Feb 2026),
// 6.6 km² (22 Nov 2026).
export function describeFloodKm2(km2: number): string {
  if (km2 >= 7) return 'polje je postalo jezero'
  if (km2 >= 4) return 'večji del polja pod vodo'
  if (km2 >= 1.5) return 'polje se polni'
  if (km2 >= 0.5) return 'voda se razliva ob Unici'
  return 'polje je suho'
}

/** "7,0" style: Slovenian decimal comma, one decimal. */
export function formatKm2(km2: number): string {
  return km2.toLocaleString('sl-SI', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}
