-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENABLE btree_gist for EXCLUDE constraint (deve vir antes de bookings) ────
create extension if not exists btree_gist;

-- ─── SPACES ───────────────────────────────────────────────────────────────────
create table if not exists spaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  amenities   text[] default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── PROFILES (extends Supabase Auth users) ───────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  phone        text,
  role         text not null default 'autonoma' check (role in ('admin', 'autonoma')),
  specialty    text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- ─── PRICING ──────────────────────────────────────────────────────────────────
create table if not exists pricing (
  id            uuid primary key default uuid_generate_v4(),
  booking_type  text not null unique check (booking_type in ('hourly', 'daily', 'weekly', 'monthly')),
  price_per_unit numeric(10,2) not null,
  unit_label    text not null,
  is_active     boolean not null default true,
  updated_at    timestamptz not null default now()
);

-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id             uuid primary key default uuid_generate_v4(),
  space_id       uuid not null references spaces(id) on delete restrict,
  user_id        uuid not null references profiles(id) on delete restrict,
  start_datetime timestamptz not null,
  end_datetime   timestamptz not null,
  booking_type   text not null check (booking_type in ('hourly', 'daily', 'weekly', 'monthly')),
  status         text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'late_cancelled', 'completed')),
  total_price    numeric(10,2) not null,
  notes          text,
  created_at     timestamptz not null default now(),
  constraint no_overlap exclude using gist (
    space_id with =,
    tstzrange(start_datetime, end_datetime, '[)') with &&
  ) where (status not in ('cancelled', 'late_cancelled'))
);

-- ─── BLOCKED PERIODS ──────────────────────────────────────────────────────────
create table if not exists blocked_periods (
  id             uuid primary key default uuid_generate_v4(),
  space_id       uuid references spaces(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime   timestamptz not null,
  reason         text,
  created_at     timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table spaces enable row level security;
alter table profiles enable row level security;
alter table pricing enable row level security;
alter table bookings enable row level security;
alter table blocked_periods enable row level security;

-- spaces: readable by all authenticated, writable by admin
create policy "spaces_select_all" on spaces for select using (auth.role() = 'authenticated');
create policy "spaces_manage_admin" on spaces for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- profiles: own profile readable/writable; admin can read all
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_select_admin" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- pricing: readable by all, writable by admin
create policy "pricing_select_all" on pricing for select using (auth.role() = 'authenticated');
create policy "pricing_manage_admin" on pricing for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- bookings: own bookings readable; admin can read/write all
create policy "bookings_select_own" on bookings for select using (user_id = auth.uid());
create policy "bookings_insert_own" on bookings for insert with check (user_id = auth.uid());
create policy "bookings_update_own" on bookings for update using (user_id = auth.uid());
create policy "bookings_select_admin" on bookings for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "bookings_manage_admin" on bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- blocked_periods: readable by authenticated, writable by admin
create policy "blocked_select_all" on blocked_periods for select using (auth.role() = 'authenticated');
create policy "blocked_manage_admin" on blocked_periods for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone, role, specialty)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'autonoma'),
    new.raw_user_meta_data->>'specialty'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
