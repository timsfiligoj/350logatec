-- 350space — add metrics column for per-acquisition derived statistics.
-- Strictly additive: a new NULLable jsonb column on a table we own
-- (space_acquisitions). Existing rows stay valid with metrics = NULL.
-- No changes to user_settings, notification_log, or any other pre-existing
-- table.

alter table public.space_acquisitions
  add column if not exists metrics jsonb;

comment on column public.space_acquisitions.metrics is
  '350space — derived statistics computed from Sentinel Hub Statistical API at acquisition time. Schema varies by view_kind. Examples — ndwi: {"mean": 0.12, "polje_water_pct": 23.4}; ndvi: {"mean": 0.62}; ndsi: {"mean": -0.05, "snow_pct": 12.8}; true_color: NULL (no derived stats).';
