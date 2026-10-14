-- Admin-managed categories: add an image and explicit sort order so
-- admins can fully control the category list from the UI (previously
-- categories were a fixed list in app code, see lib/categories.ts,
-- which this migration supersedes).

alter table categories
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0;

-- Backfill sort_order for existing rows so the old fixed ordering is
-- preserved until an admin reorders things.
with ordered as (
  select id, row_number() over (order by created_at) - 1 as rn
  from categories
)
update categories c
set sort_order = ordered.rn
from ordered
where c.id = ordered.id;

-- categories_admin_write policy (from 0001_init.sql) already covers
-- insert/update/delete for admins, and categories_public_read already
-- covers select for everyone — no RLS changes needed here.

-- Listings referencing a deleted category should fall back to
-- "uncategorized" (NULL) rather than blocking the delete.
alter table listings
  drop constraint if exists listings_category_id_fkey,
  add constraint listings_category_id_fkey
    foreign key (category_id) references categories(id) on delete set null;

------------------------------------------------------------------
-- Storage bucket for category images (mirrors listing-images).
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

create policy "category_images_public_read"
on storage.objects for select
using (bucket_id = 'category-images');

create policy "category_images_admin_insert"
on storage.objects for insert
with check (bucket_id = 'category-images' and is_admin());

create policy "category_images_admin_update"
on storage.objects for update
using (bucket_id = 'category-images' and is_admin());

create policy "category_images_admin_delete"
on storage.objects for delete
using (bucket_id = 'category-images' and is_admin());
