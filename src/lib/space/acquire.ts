// Orchestrator: catalog lookup → dedupe → process → storage upload → DB
// row. Returns enough information for the caller to display or share the
// resulting acquisition.

import { LOGATEC_AOI } from './aoi'
import { findLatestCloudFreeScene } from './catalog'
import { fetchSceneAsPng } from './process'
import { TRUE_COLOR_EVALSCRIPT } from './evalscripts/true-color'
import {
  buildStoragePath,
  getPublicUrl,
  uploadPng,
  type ViewKind,
} from './storage'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_CLOUD_COVER_PCT = 20

export type AcquireResult = {
  status: 'acquired' | 'cached'
  scene_id: string
  view_kind: ViewKind
  captured_at: string
  cloud_cover_pct: number
  storage_path: string
  public_url: string
}

export async function acquireTrueColor(opts: {
  force: boolean
}): Promise<AcquireResult> {
  const viewKind: ViewKind = 'true_color'
  const supabase = createAdminClient()

  const scene = await findLatestCloudFreeScene(LOGATEC_AOI, MAX_CLOUD_COVER_PCT)
  if (!scene) {
    throw new Error(
      `No Sentinel-2 scene with cloud cover <= ${MAX_CLOUD_COVER_PCT}% in the last 30 days over the configured AOI.`,
    )
  }

  const storagePath = buildStoragePath(viewKind, scene.sceneId, scene.capturedAt)

  if (!opts.force) {
    const { data: existing } = await supabase
      .from('space_acquisitions')
      .select('scene_id, view_kind, captured_at, cloud_cover_pct, storage_path')
      .eq('scene_id', scene.sceneId)
      .eq('view_kind', viewKind)
      .maybeSingle()

    if (existing) {
      return {
        status: 'cached',
        scene_id: existing.scene_id,
        view_kind: existing.view_kind,
        captured_at: existing.captured_at,
        cloud_cover_pct: existing.cloud_cover_pct,
        storage_path: existing.storage_path,
        public_url: getPublicUrl(existing.storage_path),
      }
    }
  }

  const png = await fetchSceneAsPng({
    bbox: LOGATEC_AOI,
    capturedAt: scene.capturedAt,
    maxCloudCoverPct: MAX_CLOUD_COVER_PCT,
    evalscript: TRUE_COLOR_EVALSCRIPT,
  })

  await uploadPng(storagePath, png, { upsert: opts.force })

  const { error: insertError } = await supabase
    .from('space_acquisitions')
    .upsert(
      {
        scene_id: scene.sceneId,
        view_kind: viewKind,
        captured_at: scene.capturedAt,
        cloud_cover_pct: scene.cloudCoverPct,
        bbox: LOGATEC_AOI,
        storage_path: storagePath,
      },
      { onConflict: 'scene_id,view_kind' },
    )

  if (insertError) {
    throw new Error(`space_acquisitions upsert failed: ${insertError.message}`)
  }

  return {
    status: 'acquired',
    scene_id: scene.sceneId,
    view_kind: viewKind,
    captured_at: scene.capturedAt,
    cloud_cover_pct: scene.cloudCoverPct,
    storage_path: storagePath,
    public_url: getPublicUrl(storagePath),
  }
}
