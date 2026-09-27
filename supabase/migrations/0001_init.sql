-- Initial schema + Row Level Security policies for the account-store template.
-- Run this via the Supabase SQL editor or `supabase db push`.
-- This mirrors prisma/schema.prisma; if you change one, change both
-- (or switch to Prisma Migrate as your single source of truth).

create extension if not exists "uuid-ossp";

create type order_status as enum ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled');
create type listing_status as enum ('draft', 'active', 'archived');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  status listing_status not null default 'draft',
  category_id uuid references categories(id),
  image_url text,
  stock_count integer not null default 0,
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  status order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'USD',
  payment_provider text,
  payment_ref text,
  buyer_note text,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  fulfilled_by uuid references profiles(id)
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  listing_id uuid not null references listings(id),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null
);

-- Delivered secrets live in their own table with the tightest policy.
create table fulfillment_assets (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  label text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Keep updated_at fresh on listings
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_set_updated_at
before update on listings
for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

------------------------------------------------------------------
-- Row Level Security
------------------------------------------------------------------

alter table profiles enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table fulfillment_assets enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- profiles: users see/update their own row; admins see all
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- categories: public read, admin write
create policy "categories_public_read" on categories
  for select using (true);
create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- listings: anyone can read active listings; admins can read/write all
create policy "listings_public_read_active" on listings
  for select using (status = 'active' or is_admin());
create policy "listings_admin_write" on listings
  for all using (is_admin()) with check (is_admin());

-- orders: buyers see their own orders; admins see all; only admins update status
create policy "orders_select_own_or_admin" on orders
  for select using (auth.uid() = buyer_id or is_admin());
create policy "orders_insert_own" on orders
  for insert with check (auth.uid() = buyer_id);
create policy "orders_update_admin_only" on orders
  for update using (is_admin());

-- order_items: visible if you can see the parent order
create policy "order_items_select" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.buyer_id = auth.uid() or is_admin())
    )
  );
create policy "order_items_insert_own" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.buyer_id = auth.uid()
    )
  );

-- fulfillment_assets: the single most sensitive table.
-- Only the buyer (after fulfillment) or an admin can ever read it.
-- Only admins can insert (i.e. only the fulfillment flow writes here).
create policy "fulfillment_select_buyer_or_admin" on fulfillment_assets
  for select using (
    is_admin()
    or exists (
      select 1 from orders
      where orders.id = fulfillment_assets.order_id
      and orders.buyer_id = auth.uid()
      and orders.status = 'fulfilled'
    )
  );
create policy "fulfillment_insert_admin_only" on fulfillment_assets
  for insert with check (is_admin());
