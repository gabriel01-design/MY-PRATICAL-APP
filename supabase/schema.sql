-- ============================================================================
--  Mama Chidi's Kitchen — Supabase schema
--  Run this in the Supabase SQL editor (or `supabase db push`).
--  Follow it with supabase/seed.sql to load the demo menu.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  Enums
-- ---------------------------------------------------------------------------
create type order_status as enum (
  'pending', 'confirmed', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'
);
create type fulfillment_type as enum ('delivery', 'pickup');
create type payment_method as enum ('pay-on-delivery', 'demo-payment');
create type payment_status as enum ('unpaid', 'paid-demo');
create type staff_role as enum ('admin', 'kitchen', 'customer');

-- ---------------------------------------------------------------------------
--  Profiles — one row per auth user, carries the staff role
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role staff_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Role helpers. security definer so policies can read profiles without
-- recursing into the profiles RLS policy.
create or replace function public.current_role()
returns staff_role
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'::staff_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_role() in ('admin', 'kitchen');
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin';
$$;

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
--  Catalogue
-- ---------------------------------------------------------------------------
create table public.categories (
  id text primary key,
  name text not null,
  emoji text not null default '🍽️',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.meals (
  id text primary key,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  category_id text references public.categories (id) on delete restrict,
  image text not null default '',
  emoji text not null default '🍽️',
  available boolean not null default true,
  featured boolean not null default false,
  popular boolean not null default false,
  -- OptionGroup[] exactly as defined in lib/types.ts
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index meals_category_id_idx on public.meals (category_id);

-- Single-row table; the api layer always reads/writes id = 1.
create table public.settings (
  id smallint primary key default 1 check (id = 1),
  restaurant_name text not null default 'My Restaurant',
  tagline text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  opening_hours text not null default '',
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  free_delivery_over integer not null default 0 check (free_delivery_over >= 0),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Orders — line items and status history are stored as jsonb because the
--  client treats an order as one immutable document. Normalise later if you
--  need per-item reporting SQL.
-- ---------------------------------------------------------------------------
create table public.orders (
  ref text primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfillment fulfillment_type not null default 'delivery',
  address text,
  notes text,
  payment_method payment_method not null default 'pay-on-delivery',
  payment_status payment_status not null default 'unpaid',
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  status order_status not null default 'pending',
  history jsonb not null default '[]'::jsonb
);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_phone_idx on public.orders (customer_phone);

-- ---------------------------------------------------------------------------
--  Row level security
--  Catalogue is world-readable and staff-writable. Orders can be created by
--  anyone (guest checkout) but only staff can read, update or delete them —
--  customers read their own order through the two security-definer RPCs below.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.meals enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: admin write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "categories: public read" on public.categories
  for select using (true);
create policy "categories: staff write" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

create policy "meals: public read" on public.meals
  for select using (true);
create policy "meals: staff write" on public.meals
  for all using (public.is_staff()) with check (public.is_staff());

create policy "settings: public read" on public.settings
  for select using (true);
create policy "settings: staff write" on public.settings
  for all using (public.is_staff()) with check (public.is_staff());

create policy "orders: guest insert" on public.orders
  for insert with check (true);
create policy "orders: staff read" on public.orders
  for select using (public.is_staff());
create policy "orders: staff update" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());
create policy "orders: staff delete" on public.orders
  for delete using (public.is_staff());

-- ---------------------------------------------------------------------------
--  Customer-facing RPCs
--  The order reference acts as a capability token. get_order_by_ref lets the
--  tracking page work without an account; find_order additionally requires the
--  phone number used at checkout.
-- ---------------------------------------------------------------------------
create or replace function public.get_order_by_ref(p_ref text)
returns setof public.orders
language sql stable security definer set search_path = public as $$
  select * from public.orders where ref = upper(trim(p_ref));
$$;

create or replace function public.find_order(p_ref text, p_phone text)
returns setof public.orders
language sql stable security definer set search_path = public as $$
  select * from public.orders
  where ref = upper(trim(p_ref))
    and right(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 10)
      = right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10);
$$;

-- Atomic status change that appends to the history array.
-- security invoker: the "orders: staff update" policy still applies.
create or replace function public.set_order_status(p_ref text, p_status order_status)
returns setof public.orders
language sql as $$
  update public.orders
  set status = p_status,
      history = history || jsonb_build_object('status', p_status, 'at', now())
  where ref = p_ref
  returning *;
$$;

grant execute on function public.current_role(), public.is_staff(), public.is_admin()
  to anon, authenticated;
grant execute on function public.get_order_by_ref(text), public.find_order(text, text)
  to anon, authenticated;
grant execute on function public.set_order_status(text, order_status)
  to authenticated;

-- ---------------------------------------------------------------------------
--  Promote a staff member (run after they sign up / are created):
--    update public.profiles set role = 'admin'   where email = 'owner@example.com';
--    update public.profiles set role = 'kitchen' where email = 'chef@example.com';
-- ---------------------------------------------------------------------------
