// Supabase Storage helpers for the space-imagery bucket. Uploads go through
// the service-role admin client so they bypass RLS; reads are public.

import { createAdminClient } from '@/lib/supabase/admin'

export const SPACE_IMAGERY_BUCKET = 'space-imagery'

export type ViewKind = 'true_color' | 'ndwi' | 'ndvi' | 'ndsi'

// Everything stored in space-imagery / space_acquisitions. Radar lives
// beside the optical ViewKinds rather than inside them so the per-kind
// optical config tables in acquire.ts don't need a radar entry.
export type StoredKind = ViewKind | 's1_water'

export function buildStoragePath(
  viewKind: StoredKind,
  sceneId: string,
  capturedAt: string,
): string {
  const yearMonth = capturedAt.slice(0, 7) // YYYY-MM
  const safeSceneId = sceneId.replace(/\.SAFE$/, '')
  return `${viewKind}/${yearMonth}/${safeSceneId}.png`
}

export async function uploadPng(
  path: string,
  png: Buffer,
  opts: { upsert: boolean },
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(SPACE_IMAGERY_BUCKET)
    .upload(path, png, {
      contentType: 'image/png',
      upsert: opts.upsert,
    })
  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }
}

export function getPublicUrl(path: string): string {
  const supabase = createAdminClient()
  const { data } = supabase.storage
    .from(SPACE_IMAGERY_BUCKET)
    .getPublicUrl(path)
  return data.publicUrl
}
