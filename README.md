# lmarketz — digital marketplace

Next.js (App Router) + Supabase + Tailwind + shadcn/ui.

Manual fulfillment out of the box: buyer pays (or, until you wire up a payment
provider, just checks out), admin reviews the order and pastes in the
delivered content, buyer sees it appear on their order page. No payment
provider is connected yet — `lib/payments/provider.ts` is stubbed so you can
test the whole flow before deciding on Stripe or Paddle.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, Server Components |
| Auth + DB | Supabase (Postgres + Auth + Row Level Security) |
| Payments | Stubbed abstraction — wire in Stripe or Paddle when ready |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Click **Connect** at the top of the project page (there's no separate
   "Database" tab in Project Settings anymore — connection info and API
   keys both live behind this one dialog now).
3. On the **App Frameworks** / **API Keys** tab, copy the project URL, the
   **publishable** key (`sb_publishable_...`), and the **secret** key
   (`sb_secret_...`). These replace the old `anon` and `service_role` JWT
   keys — Supabase is deprecating those by the end of 2026, so this
   template uses the new keys directly rather than the legacy ones.

Copy `.env.example` to `.env` and fill these in:

```bash
cp .env.example .env
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_..., safe in the browser
SUPABASE_SECRET_KEY=                    # sb_secret_..., server-only, keep secret
```

> If your project is old enough to still show `anon` / `service_role`
> keys, you can generate publishable/secret keys for it from
> **Settings → API Keys → Publishable and secret API keys**. Both key
> types work side by side, so nothing breaks while you switch over.

## 3. Set up the database

Open the Supabase SQL editor and run, in order:
1. `supabase/migrations/0001_init.sql` — creates all tables, the
   `handle_new_user` trigger (auto-creates a `profiles` row on signup), and
   all Row Level Security policies.
2. `supabase/migrations/0002_seed_categories.sql` — no-op placeholder, kept
   only for migration history. Categories are created from the admin UI now
   (see step 4 below), not seeded via SQL.
3. `supabase/migrations/0002_listing_images_storage.sql` — creates the
   storage bucket used for listing images.
4. `supabase/migrations/0003_add_username.sql` — adds a nullable, unique
   `username` column to `profiles` for the account settings page.
5. `supabase/migrations/0004_admin_categories.sql` — adds `image_url` and
   `sort_order` to `categories`, makes deleting a category set
   `listings.category_id` to `NULL` instead of blocking the delete, and
   creates the `category-images` storage bucket (same admin-only write
   policy pattern as listing images).

## 4. Create your admin user

1. Sign up normally through the app (`/sign-up`) once it's running, **or**
   create a user directly in Supabase Auth → Users.
2. In the Supabase SQL editor, promote that user to admin:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
   Admin routes (`/admin/*`) check `profiles.role`, and `middleware.ts`
   redirects non-admins away from `/admin`.
3. Sign in as that user and go to `/admin/categories` to create at least
   one category — the listing form needs one to exist before you can
   create or edit a listing.

## 5. Run it

```bash
npm run dev
```
Visit `http://localhost:3000`.

## Categories

Categories are fully admin-managed at `/admin/categories` — no fixed list
in app code anymore. An admin can create, rename, re-slug, upload an image
for, reorder, and delete categories from that page.

- Each category has a `name`, a `slug` (auto-generated from the name if
  left blank), an optional `image_url`, and a `sort_order` used everywhere
  categories are listed (sidebar, browse page sections, filter pills).
- Category images upload to the `category-images` Supabase Storage bucket,
  the same way listing photos upload to `listing-images` — see
  `app/api/admin/categories/upload/route.ts`.
- The listing form (`/admin/listings/new` and `/admin/listings/[id]`)
  shows a dropdown of existing categories by name and submits the chosen
  row's `id` directly. If no categories exist yet, the form tells you to
  create one at `/admin/categories` first.
- The browse page (`/listings`) groups active listings into sections by
  category, in `sort_order`, and skips empty sections. Filter pills at the
  top link to `/listings?category=<slug>` for a single-category view.
  Listings whose category was deleted show up under "Uncategorized"
  rather than disappearing.
- **Deleting a category does not delete its listings** — the migration's
  foreign key is `on delete set null`, so those listings just lose their
  category and fall back to "Uncategorized" until reassigned.

## Search

The browse page (`/listings`) has a search box (also mirrored in the site
header) that matches against listing title, description, and category
name via the `?q=` query param. It's an in-memory filter over the same
cached fetch used for category filtering — see
`app/(shop)/listings/page.tsx` — not a database full-text search, so it's
fine for a catalog of hundreds/low-thousands of listings but isn't meant
to scale to a huge catalog as-is.

## Account settings

The header's profile icon links to `/account` — a settings page, not
straight to order history. From there a signed-in user can:

- Set or change a **username** (optional, unique if set — enforced by a
  partial unique index so multiple users can each leave it blank).
- Change their **password** via `supabase.auth.updateUser()`.
- Sign out.
- Jump to **order history** at `/account/orders` (unchanged, just no
  longer the icon's default destination).

There's intentionally no avatar/profile picture upload — keeping this
template's auth surface small and avoiding file storage/moderation
concerns that come with user-uploaded images. If you want one later,
Supabase Storage with a private bucket + signed URLs is the usual path.

## How the fulfillment flow works

1. Buyer adds items to cart (stored in `localStorage` via
   `components/shop/cart-provider.tsx`) and checks out.
2. `POST /api/orders` re-prices everything server-side from the `listings`
   table (never trusts client-submitted prices), creates an `orders` row
   with `status: "pending"`, and creates `order_items`.
3. Checkout redirects through `lib/payments/provider.ts`. Right now this is
   the `manualProvider`, which just sends the buyer to their order page —
   no real payment happens yet. See "Adding a payment provider" below.
4. Admin opens `/admin/orders`, finds the order, clicks **Fulfill**, pastes
   in the credentials/instructions to deliver.
5. `POST /api/admin/orders/[id]/fulfill` checks the caller is an admin,
   writes the content to `fulfillment_assets`, and flips the order to
   `status: "fulfilled"`.
6. Buyer's order page (`/orders/[id]`) shows the delivered content once
   `status` is `fulfilled`. `fulfillment_assets` has its own RLS policy —
   only the buyer (and only once fulfilled) or an admin can ever read it.

## Adding a payment provider

Everything is designed so this is a small, contained change:

1. Implement `lib/payments/stripe.ts` (or `paddle.ts`) satisfying the
   `PaymentProvider` interface in `lib/payments/provider.ts` — create a
   hosted checkout session, return its URL.
2. Swap the `paymentProvider` export in `lib/payments/provider.ts` to your
   new implementation.
3. Add a webhook route (e.g. `app/api/webhooks/stripe/route.ts`) that
   verifies the signature and, on successful payment, updates the matching
   `orders` row to `status: "paid"` (use `createServiceRoleClient()` from
   `lib/supabase/server.ts` since webhooks have no user session).
4. Add the provider's secret keys to `.env`.

**Before you pick a provider:** confirm whatever you're selling is allowed
under that provider's terms of service. Both Stripe and Paddle restrict or
prohibit certain categories of digital-account sales, and violating this
can get a merchant account terminated with funds held. Read the relevant
policy pages before building further.

## Security notes

- All sensitive reads/writes are protected by Postgres Row Level Security
  (see `supabase/migrations/0001_init.sql`), not just app-layer checks —
  so even if a route handler had a bug, the database itself refuses
  unauthorized access.
- `fulfillment_assets` (the table holding delivered credentials) is the
  most locked-down table: only the buyer of a *fulfilled* order, or an
  admin, can ever `select` from it.
- The secret-key Supabase client (`createServiceRoleClient()`, using
  `SUPABASE_SECRET_KEY`) bypasses RLS entirely — same privilege level the
  old `service_role` key had. It's used in exactly one place in this
  template — the fulfill route — and only after verifying the caller's
  session shows `role: admin`. Don't import it into client components or
  anything that runs in the browser. (Supabase's API gateway now also
  rejects `sb_secret_...` keys sent with a browser User-Agent as a second
  line of defense, but treat this as server-only regardless.)
- Order totals are always recalculated server-side from the `listings`
  table at checkout; the client only sends listing IDs and quantities.

## Project structure

```
app/
  (auth)/sign-in, sign-up        — Supabase email/password auth
  (shop)/listings, cart, checkout, orders/[id]  — buyer-facing storefront
  account, account/orders        — account settings (username/password/sign out) + order history
  admin/orders, admin/listings   — admin dashboard (role-gated)
  api/orders                     — creates orders, re-prices server-side
  api/listings                   — admin CRUD for listings
  api/admin/orders/[id]/fulfill  — the one place that writes delivered content
components/
  ui/        — shadcn/ui primitives
  shop/      — cart provider, listing card/form, category manager, fulfill dialog, order timeline, account settings form
  layout/    — header/footer/sidebar/cookie banner
lib/
  supabase/  — browser, server, service-role clients + middleware session refresh
  payments/  — provider abstraction (stubbed; see above)
supabase/
  migrations/0001_init.sql            — tables + RLS policies, source of truth for the DB
  migrations/0002_seed_categories.sql — no-op placeholder (categories are admin-managed now)
  migrations/0002_listing_images_storage.sql — storage bucket for listing images
  migrations/0003_add_username.sql    — adds profiles.username
  migrations/0004_admin_categories.sql — categories.image_url/sort_order, category-images bucket
```

## Known gaps to fill in before shipping

- No email notifications yet (buyer isn't emailed when an order is
  fulfilled — the TODO is marked in the fulfill route).
- No payment provider connected (see above).
- `types/database.ts` is hand-written; once your Supabase project exists,
  regenerate it properly:
  ```bash
  npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
  ```
- `fulfillment_assets.content` is stored as plain text. If what you're
  delivering is sensitive, encrypt it at rest (e.g. via `pgsodium` in
  Supabase, or application-level encryption before insert / decryption on
  read) rather than relying on RLS alone.
- Terms/Privacy/Support pages are placeholders — replace before launch.
