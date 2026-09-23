# accountstore — digital goods storefront template

Next.js (App Router) + Supabase + Prisma + Tailwind + shadcn/ui + Framer Motion.

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
| ORM | Prisma (optional — Supabase client is used by the app; Prisma is there for typed queries / migrations if you prefer it) |
| Payments | Stubbed abstraction — wire in Stripe or Paddle when ready |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Motion | Framer Motion |

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
4. On the **ORMs** tab, pick **Prisma** and copy the connection strings it
   gives you: the pooled one (port 6543, for `DATABASE_URL`) and the
   direct one (port 5432, for `DIRECT_URL`).

Copy `.env.example` to `.env` and fill these in:

```bash
cp .env.example .env
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_..., safe in the browser
SUPABASE_SECRET_KEY=                    # sb_secret_..., server-only, keep secret
DATABASE_URL=                           # pooled (6543), used at runtime by Prisma
DIRECT_URL=                             # direct (5432), used for migrations
```

> If your project is old enough to still show `anon` / `service_role`
> keys, you can generate publishable/secret keys for it from
> **Settings → API Keys → Publishable and secret API keys**. Both key
> types work side by side, so nothing breaks while you switch over.

## 3. Set up the database

You have two equally valid options — pick one:

**Option A — SQL migration (fastest to get running):**
Open the Supabase SQL editor and run, in order:
1. `supabase/migrations/0001_init.sql` — creates all tables, the
   `handle_new_user` trigger (auto-creates a `profiles` row on signup), and
   all Row Level Security policies.
2. `supabase/migrations/0002_seed_categories.sql` — inserts the fixed
   category set (Steam, Valorant, CS:GO, Minecraft, Fortnite, Other) that
   the listing form and browse page expect. Without this, the category
   dropdown on `/admin/listings/new` has nothing to select.
3. `supabase/migrations/0003_add_username.sql` — adds a nullable, unique
   `username` column to `profiles` for the account settings page
   (`/account`). Existing users just have `username = null` until they set
   one.

**Option B — Prisma migrate:**
```bash
npx prisma migrate dev --name init
```
Note: Prisma won't create the `handle_new_user` trigger or RLS policies
(those are Postgres/Supabase-specific, not part of Prisma's schema
language), so you'd still need to run the trigger + policy sections of
`0001_init.sql` by hand afterward. If you're not sure which to pick, use
Option A. Either way, `npm run db:seed` (step 5 below) inserts the same
category rows via Prisma, so you don't need to also run
`0002_seed_categories.sql` if you're seeding that way.

Either way, generate the Prisma client so `lib/prisma.ts` works:
```bash
npx prisma generate
```

## 4. Create your admin user

1. Sign up normally through the app (`/sign-up`) once it's running, **or**
   create a user directly in Supabase Auth → Users.
2. In the Supabase SQL editor, promote that user to admin:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
   Admin routes (`/admin/*`) check `profiles.role`, and `middleware.ts`
   redirects non-admins away from `/admin`.

## 5. Seed example data (optional)

```bash
npm run db:seed
```
Inserts the fixed category set (see step 3) plus two example listings —
one filed under Steam, one under Other — so `/`, `/listings`, and the
admin category dropdown aren't empty on first run. Safe to run even if
you already ran `0002_seed_categories.sql` in the SQL editor; both use
upserts keyed on slug.

## 6. Run it

```bash
npm run dev
```
Visit `http://localhost:3000`.

## Categories

The storefront uses a fixed category list (Steam, Valorant, CS:GO,
Minecraft, Fortnite, Other) rather than letting admins create arbitrary
categories. This keeps the browse page's grouped sections and icons
predictable. The list lives in one place: `lib/categories.ts`.

- **Icons are generic `lucide-react` glyphs, not brand logos** — game/platform
  names and logos are trademarks of their respective owners, so no Steam,
  Riot, Valve, Mojang, or Epic artwork is reproduced here.
- The listing form (`/admin/listings/new` and `/admin/listings/[id]`)
  shows a category dropdown that defaults to **Other**. Selecting a
  category resolves it to the matching row's `id` in the `categories`
  table before submitting.
- The browse page (`/listings`) groups active listings into sections by
  category, in the order defined in `lib/categories.ts`, and skips empty
  sections. Filter pills at the top link to `/listings?category=<slug>`
  for a single-category view.
- **To add a category:** add an entry to the `CATEGORIES` array in
  `lib/categories.ts` (slug, label, a `lucide-react` icon, a color class),
  then insert a matching row into the `categories` table with the same
  slug (either via SQL or by adding it to `prisma/seed.ts`). The slug is
  the link between the two — if they don't match, the new category won't
  render an icon/label (it'll fall back to "Other" styling) even though
  the underlying data is fine.

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
  motion/    — reusable Framer Motion wrappers (FadeIn, StaggerGrid, PageTransition)
  shop/      — cart provider, listing card/form, fulfill dialog, order timeline, account settings form
  layout/    — header/footer
lib/
  supabase/  — browser, server, service-role clients + middleware session refresh
  payments/  — provider abstraction (stubbed; see above)
  categories.ts — fixed category list (slug/label/icon) driving the listing form + browse page
  prisma.ts  — Prisma client singleton (optional path — app currently uses Supabase client directly)
prisma/
  schema.prisma  — mirrors the Supabase schema for typed Prisma queries/migrations
  seed.ts         — seeds categories + example listings
supabase/
  migrations/0001_init.sql            — tables + RLS policies, source of truth for the DB
  migrations/0002_seed_categories.sql — inserts the fixed category rows (SQL-editor path)
  migrations/0003_add_username.sql    — adds profiles.username
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
