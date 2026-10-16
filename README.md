# Mama Chidi's Kitchen

A restaurant ordering system built as a portfolio demo with **Next.js (App Router)**. Customers browse the menu, customise meals, place an order and track it; staff manage everything from an admin dashboard and a live kitchen board.

By default it runs with **no backend**: all state lives in the browser's `localStorage`, so the customer site, the admin portal and the kitchen display share one source of truth within a browser and stay in sync across open tabs. An optional **Supabase** backend (Postgres + Auth) turns it into a shared, multi-device app — see [Connecting Supabase](#connecting-supabase-optional).

## Features

**Customer site**

- Menu with search, category filters and sold-out handling
- Meal detail pages with options/extras and quantity selection
- Persistent cart with per-line notes
- Checkout with delivery or pickup, validation and free-delivery rules
- Order confirmation with a generated reference (e.g. `MC-4KQ7ZP`)
- Order tracking with a status timeline
- "My orders" lookup by reference or phone number
- Responsive layout, skeleton loading states and empty states

**Admin portal** (`/admin`)

- Dashboard with totals, recent orders and a 7-day sales chart
- Order management: update status (confirmed → preparing → ready → completed, or reject/cancel)
- Menu manager: create, edit and delete meals
- Category manager (blocks deleting categories that still have meals)
- Reports: revenue, order counts and best sellers
- Settings: restaurant details, delivery fee, free-delivery threshold, reset demo data
- Seed sample orders to populate the dashboard

**Kitchen display** (`/kitchen`)

- Staff-only (access code required)
- Dark, at-a-glance board of active orders
- Elapsed time per order and status progression
- Refreshes as orders change

## Tech stack

- Next.js 16 (App Router, Cache Components / partial prerendering, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- Optional [Supabase](https://supabase.com) backend (Postgres + Auth). With no
  configuration the app runs entirely in the browser, so no database is required
  to try it out. Meal images are served from Unsplash.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Meal images load from `images.unsplash.com`, so an internet connection is needed for photos to appear.

With no environment variables set, the app runs in **local demo mode**: all data
(menu edits, orders, settings) lives in `localStorage`, exactly as described in
[How the data works](#how-the-data-works). To use a shared, multi-device backend,
see [Connecting Supabase](#connecting-supabase-optional).

### Staff access code

The admin portal (`/admin`) and the kitchen board (`/kitchen`) are unlocked by a
single shared **access code**. The default is:

```
MAMACHEF
```

Overriding it is optional: set `NEXT_PUBLIC_ADMIN_ACCESS_CODE` in `.env.local`
(see `.env.example`). Spaces, hyphens and letter-case are ignored when the code
is checked, so `mama chef` and `MamaChef` both work. This is demo-grade
protection: the code is shipped to the browser, so it keeps casual visitors out
of the staff UI but is not real authentication — see
[Known limitations](#known-limitations).

## Connecting Supabase (optional)

The frontend talks to the backend through a single seam (`lib/backend`) with two
implementations selected at runtime:

- **`local`** — the default. Everything in `localStorage`, no network.
- **`supabase`** — used automatically when both of these env vars are present.

Copy `.env.example` to `.env.local` and fill in your project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Then set up the database, using either the Supabase CLI or the dashboard:

**With the Supabase CLI (recommended)**

```bash
supabase link --project-ref <project-ref>
supabase db push          # applies supabase/schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql   # seeds categories, meals, settings
```

**Manually** — open the SQL editor in your Supabase project and run, in order:

1. `supabase/schema.sql` — tables, enums, row-level security policies, role
   helpers, the new-user trigger and the public RPCs.
2. `supabase/seed.sql` — the demo menu and restaurant settings. Regenerate it
   after editing `lib/data/menu.ts`:

   ```bash
   node scripts/generate-seed.mjs
   ```

Restart the dev server. The app now reads and writes through Supabase and the
menu/orders are shared across devices. Staff still unlock the dashboard with the
shared access code (above).

**What changes in Supabase mode**

- Menu, categories, settings and orders are stored in Postgres.
- Orders are written with the anon key; reads/updates require a `kitchen` or
  `admin` profile, enforced by RLS. The public tracking page uses the
  `get_order_by_ref` RPC.
- Writes are optimistic: the UI updates immediately and rolls back if the server
  rejects them. Failed writes are queued in a localStorage outbox and retried on
  the next load or when the tab regains focus.
- Realtime subscriptions are **not** enabled; the kitchen board and tracking page
  refresh on load/focus (see Known limitations).
- **Staff writes still need a Supabase session.** The access code only unlocks
  the UI, so if you tighten the RLS policies to require an authenticated `admin`
  role, admin edits from the dashboard will be rejected. Disable those policies
  for the demo, or wire the dashboard to Supabase Auth.

### Staff roles and security

- `profiles.role` is `customer` by default (set by a trigger on new users) and
  can be promoted to `admin` or `kitchen` in SQL:
  `update public.profiles set role = 'admin' where email = 'you@example.com';`
- The access-code gate runs entirely in the browser and is not a security
  boundary. RLS on the database is what actually protects the data.
- Only the `anon` key is used on the client. Never ship the `service_role` key.

## Scripts


| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Routes

| Route                    | Description                          |
| ------------------------ | ------------------------------------ |
| `/`                      | Home / marketing page                |
| `/menu`                  | Menu with search and filters         |
| `/food/[id]`             | Meal details and options             |
| `/cart`                  | Cart                                 |
| `/checkout`              | Checkout                             |
| `/confirmation/[ref]`    | Order confirmation                   |
| `/tracking/[ref]`        | Order status tracking                |
| `/my-orders`             | Find an order by reference or phone  |
| `/about`                 | About the restaurant and the demo    |
| `/admin`                 | Admin dashboard (access code)        |
| `/admin/orders`          | Order management                     |
| `/admin/menu`            | Menu management                      |
| `/admin/categories`      | Category management                  |
| `/admin/reports`         | Reporting                            |
| `/admin/settings`        | Restaurant settings                  |
| `/kitchen`               | Kitchen display board (access code)  |

## How the data works

Data access goes through `lib/backend`, which exposes a small `DataBackend`
interface and picks an implementation at runtime:

- `lib/backend/local.ts` — the default. Everything is stored under the
  `mama-chidis-demo-v1` key in `localStorage`; the cart uses
  `mama-chidis-cart-v1`, the staff session uses `mama-chidis-admin-v1`, and
  the offline write queue uses `mama-chidis-outbox-v1`.
- `lib/backend/supabase.ts` — used when `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. Maps rows to the camelCase domain
  types and calls the database directly.

`StoreProvider` (`lib/store.tsx`) hydrates from the active backend on mount,
persists changes, keeps multiple tabs in sync (including the browser `storage`
event), retries queued writes on load/focus, and exposes everything through the
`useStore()` hook. State is managed with a `useReducer` reducer, and writes are
applied optimistically and rolled back if the backend rejects them. Seed content
(categories, meals, settings, testimonials) lives in `lib/data/menu.ts`; sample
orders are generated in `lib/data/sample-orders.ts`.

Use **Admin → Settings → Reset demo data** to clear orders and restore the seed
menu and settings.

## Project structure

```
app/
  (site)/          Customer pages (header + footer via the group layout)
  (admin)/         Admin pages, wrapped in the authenticated AdminShell
  (kitchen)/       Kitchen display, behind the staff gate
  layout.tsx       Root layout: fonts, metadata, StoreProvider
  manifest.ts      PWA manifest
components/
  admin/           Admin dashboard, managers and shell
  kitchen/         Kitchen board
  staff-gate.tsx   Login gate for staff-only screens
  ui.tsx           Shared UI primitives (badges, fields, brand mark, stars)
lib/
  backend/         Backend seam: interface, local + Supabase implementations
  supabase/        Browser client and database types
  store.tsx        Global store, actions and hydration
  use-order.ts     Resolves an order by reference for the tracking pages
  types.ts         Domain types and pricing helpers
  data/            Seed menu and sample orders
  format.ts        Currency and date formatting
supabase/
  schema.sql       Tables, enums, RLS policies, RPCs and triggers
  seed.sql         Generated demo data (see scripts/generate-seed.mjs)
scripts/
  generate-seed.mjs  Regenerates supabase/seed.sql from lib/data/menu.ts
```

## Known limitations

- **No realtime updates.** Without subscriptions, the kitchen board and tracking
  page only refresh on load/focus, so status changes appear after a refresh.
- **In local demo mode there is no backend.** Orders and menu edits are
  per-browser and per-device; clearing site data deletes them.
- **Simulated payments.** The "demo payment" option just marks an order as paid.
- **Demo authentication.** The staff area is gated by a single shared access
  code (`NEXT_PUBLIC_ADMIN_ACCESS_CODE`, default `MAMACHEF`). Because it
  is shipped to the browser it protects nothing but the UI; the database (when
  configured) is the real security boundary via RLS.
- **Order tracking is link-based.** Anyone who knows a reference (and, for the
  `/my-orders` lookup, the phone number) can view that order; there are no
  customer accounts.
- Meal images are remote (Unsplash); offline use shows broken images.


## Deployment

The project builds as a standard Next.js app and deploys to Vercel or any Node host:

```bash
npm run build
npm run start
```
