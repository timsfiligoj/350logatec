-- 350space: allow Sentinel-1 radar flood frames in space_acquisitions.
-- Strictly additive: widens the view_kind check constraint with one new
-- value. Existing rows and the four optical view kinds are untouched.
--
-- s1_water rows: one per UTC day with a Sentinel-1 pass over Planinsko
-- polje. scene_id is 'S1_WATER_<YYYY-MM-DD>', cloud_cover_pct is NULL
-- (radar sees through clouds), metrics = {"water_km2": 7.0, "water_pct": 6.5}.

alter table public.space_acquisitions
  drop constraint space_acquisitions_view_kind_check;

alter table public.space_acquisitions
  add constraint space_acquisitions_view_kind_check
    check (view_kind in ('true_color', 'ndwi', 'ndvi', 'ndsi', 's1_water'));
