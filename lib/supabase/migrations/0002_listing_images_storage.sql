-- Storage bucket for listing photos.
--
-- Why Supabase Storage and not the local filesystem: Vercel's function
-- filesystem is read-only at runtime (only /tmp is writable, and it's
-- wiped between invocations/deploys), so writing uploaded files to
-- disk with fs.writeFile works in `next dev` locally but silently
-- breaks in production. Supabase Storage is an S3-backed object store
-- that works identically from `next dev` and from Vercel, needs no
-- extra infra, and reuses the Supabase project already configured for
-- auth/DB.

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Public read (bucket is public, but RLS still governs the storage.objects
-- table itself — belt-and-suspenders, and required for the bucket's
-- public URLs to resolve reliably).
create policy "listing_images_public_read"
on storage.objects for select
using (bucket_id = 'listing-images');

-- Only admins may upload/replace/delete listing photos.
create policy "listing_images_admin_insert"
on storage.objects for insert
with check (bucket_id = 'listing-images' and is_admin());

create policy "listing_images_admin_update"
on storage.objects for update
using (bucket_id = 'listing-images' and is_admin());

create policy "listing_images_admin_delete"
on storage.objects for delete
using (bucket_id = 'listing-images' and is_admin());
