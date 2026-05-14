// Server-side helpers for reading space_acquisitions. RLS is open for read,
// but we use the admin client because these reads happen during SSR where we
// don't need to set cookies.

import { createAdminClient } from '@/lib/supabase/admin'
import { getPublicUrl, type ViewKind } from './storage'

export type Acquisition = {
  scene_id: string
  view_kind: ViewKind
  captured_at: string
  cloud_cover_pct: number
  storage_path: string
  metrics: Record<string, number> | null
}

export type AcquisitionWithUrl = Acquisition & {
  public_url: string
  /** Captured-at parsed to YYYY-MM for grouping. */
  month: string
}

function decorate(row: Acquisition): AcquisitionWithUrl {
  return {
    ...row,
    public_url: getPublicUrl(row.storage_path),
    month: row.captured_at.slice(0, 7),
  }
}

export async function getLatestForView(
  viewKind: ViewKind,
): Promise<AcquisitionWithUrl | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('space_acquisitions')
    .select('scene_id, view_kind, captured_at, cloud_cover_pct, storage_path, metrics')
    .eq('view_kind', viewKind)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`getLatestForView(${viewKind}) failed: ${error.message}`)
  if (!data) return null
  return decorate(data as Acquisition)
}

export async function getHistoryForView(
  viewKind: ViewKind,
): Promise<AcquisitionWithUrl[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('space_acquisitions')
    .select('scene_id, view_kind, captured_at, cloud_cover_pct, storage_path, metrics')
    .eq('view_kind', viewKind)
    .order('captured_at', { ascending: true })

  if (error) throw new Error(`getHistoryForView(${viewKind}) failed: ${error.message}`)
  return ((data ?? []) as Acquisition[]).map(decorate)
}

/** Find the acquisition with the largest value for a given metric key. */
export function peakBy(
  rows: AcquisitionWithUrl[],
  metricKey: string,
): AcquisitionWithUrl | null {
  let best: AcquisitionWithUrl | null = null
  let bestVal = -Infinity
  for (const row of rows) {
    const v = row.metrics?.[metricKey]
    if (typeof v === 'number' && v > bestVal) {
      bestVal = v
      best = row
    }
  }
  return best
}
