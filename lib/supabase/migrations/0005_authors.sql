-- Sellers/authors. Everything here (name, tags, sales, rating, reviews)
-- is set manually by admins — purely presentational, not computed.
create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  tags text[] not null default '{}',
  sales_count integer not null default 0 check (sales_count >= 0),
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  is_anonymous boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one default author ("site owner") at a time.
create unique index if not exists authors_one_default on authors (is_default) where is_default;

alter table authors enable row level security;
create policy "authors_public_read" on authors for select using (true);
create policy "authors_admin_write" on authors for all using (is_admin()) with check (is_admin());

-- Listings without an author fall back to the default author in the UI.
alter table listings
  add column if not exists author_id uuid references authors(id) on delete set null;

-- Fictional seed data (UI only).
insert into authors (name, tags, sales_count, rating, review_count, is_anonymous, is_default) values
  ('Site Owner', array['Official','Verified','Fast delivery'], 1280, 4.9, 612, false, true),
  ('NovaVault', array['Top seller','Verified'], 540, 4.7, 233, false, false),
  ('PixelForge', array['Trusted','Fast delivery'], 312, 4.5, 140, false, false),
  ('Kairo Market', array['Pro seller'], 96, 4.2, 41, false, false),
  ('Hidden', array['Verified'], 210, 4.6, 88, true, false)
on conflict do nothing;
