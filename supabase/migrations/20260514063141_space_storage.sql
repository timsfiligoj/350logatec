-- 350space — storage bucket for pre-rendered Sentinel-2 visualizations.
-- Public-read so /vesolje can serve PNGs directly to unauthenticated visitors.
-- Writes are performed by the service-role admin client, which bypasses RLS,
-- so no explicit write policy is needed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'space-imagery',
  'space-imagery',
  true,
  10485760,                      -- 10 MB per file cap
  array['image/png']::text[]
);

create policy "space_imagery_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'space-imagery');
