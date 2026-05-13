-- 350space — initial schema
-- Adds the space_acquisitions table for tracking pre-rendered Sentinel-2 scenes.
-- Strictly additive: no ALTER/DROP/RENAME of existing public.user_settings or
-- public.notification_log. Read-public via RLS so unauthenticated visitors can
-- see the visualizations.

create table public.space_acquisitions (
  id uuid primary key default gen_random_uuid(),
  scene_id text not null,
  view_kind text not null,
  captured_at timestamptz not null,
  cloud_cover_pct numeric(5, 2),
  bbox jsonb not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint space_acquisitions_scene_kind_unique unique (scene_id, view_kind),
  constraint space_acquisitions_view_kind_check
    check (view_kind in ('true_color', 'ndwi', 'ndvi', 'ndsi')),
  constraint space_acquisitions_cloud_cover_range
    check (cloud_cover_pct is null or (cloud_cover_pct >= 0 and cloud_cover_pct <= 100))
);

create index space_acquisitions_kind_captured_idx
  on public.space_acquisitions (view_kind, captured_at desc);

alter table public.space_acquisitions enable row level security;

create policy "space_acquisitions_public_read"
  on public.space_acquisitions
  for select
  to anon, authenticated
  using (true);

comment on table public.space_acquisitions is
  '350space — index of pre-rendered Sentinel-2 acquisitions stored in Supabase Storage. One row per (scene_id, view_kind).';
comment on column public.space_acquisitions.scene_id is
  'Sentinel-2 product identifier returned by CDSE Catalog (e.g. S2A_MSIL2A_...).';
comment on column public.space_acquisitions.view_kind is
  'Visualization derived from this scene: true_color | ndwi | ndvi | ndsi.';
comment on column public.space_acquisitions.bbox is
  'WGS84 bounding box used when requesting the scene from Sentinel Hub Process API. Stored as [minLon, minLat, maxLon, maxLat].';
comment on column public.space_acquisitions.storage_path is
  'Object path inside the Supabase Storage bucket holding the rendered WebP/PNG.';
