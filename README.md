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
2. In **Project Settings → API**, copy the URL, `anon` key, and
   `service_role` key.
3. In **Project Settings → Database**, copy the pooled connection string
   (port 6543) and the direct connection string (port 5432).

Copy `.env.example` to `.env` and fill these in:

```bash
cp .env.example .env
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, keep secret
DATABASE_URL=                   # pooled (6543), used at runtime by Prisma
DIRECT_URL=                     # direct (5432), used for migrations
```

## 3. Set up the database

You have two equally valid options — pick one:

**Option A — SQL migration (fastest to get running):**
Open the Supabase SQL editor and run the contents of
`supabase/migrations/0001_init.sql`. This creates all tables, the
`handle_new_user` trigger (auto-creates a `profiles` row on signup), and all
Row Level Security policies.

**Option B — Prisma migrate:**
```bash
npx prisma migrate dev --name init
```
Note: Prisma won't create the `handle_new_user` trigger or RLS policies
(those are Postgres/Supabase-specific, not part of Prisma's schema
language), so you'd still need to run the trigger + policy sections of
`0001_init.sql` by hand afterward. If you're not sure which to pick, use
Option A.

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
Adds one example category and one active listing so `/` and `/listings`
aren't empty on first run.

## 6. Run it

```bash
npm run dev
```
Visit `http://localhost:3000`.

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
- The service-role Supabase client (`createServiceRoleClient()`) bypasses
  RLS entirely. It's used in exactly one place in this template — the
  fulfill route — and only after verifying the caller's session shows
  `role: admin`. Don't import it into client components or anything that
  runs in the browser.
- Order totals are always recalculated server-side from the `listings`
  table at checkout; the client only sends listing IDs and quantities.

## Project structure

```
app/
  (auth)/sign-in, sign-up        — Supabase email/password auth
  (shop)/listings, cart, checkout, orders/[id]  — buyer-facing storefront
  account/orders                 — buyer's order history
  admin/orders, admin/listings   — admin dashboard (role-gated)
  api/orders                     — creates orders, re-prices server-side
  api/listings                   — admin CRUD for listings
  api/admin/orders/[id]/fulfill  — the one place that writes delivered content
components/
  ui/        — shadcn/ui primitives
  motion/    — reusable Framer Motion wrappers (FadeIn, StaggerGrid, PageTransition)
  shop/      — cart provider, listing card/form, fulfill dialog, order timeline
  layout/    — header/footer
lib/
  supabase/  — browser, server, service-role clients + middleware session refresh
  payments/  — provider abstraction (stubbed; see above)
  prisma.ts  — Prisma client singleton (optional path — app currently uses Supabase client directly)
prisma/
  schema.prisma  — mirrors the Supabase schema for typed Prisma queries/migrations
  seed.ts
supabase/
  migrations/0001_init.sql  — tables + RLS policies, source of truth for the DB
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
