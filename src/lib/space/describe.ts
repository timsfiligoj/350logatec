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
