-- ══════════════════════════════════════════════════════════════
-- Nepal Untrodden — Database Schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════

-- ── 1. Profiles (extends auth.users) ──────────────────────────
create table if not exists profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  full_name  text,
  avatar_url text,
  role       text check (role in ('traveler', 'guide', 'host', 'admin')) default 'traveler',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── 2. Guides ─────────────────────────────────────────────────
create table if not exists guides (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references profiles(id) on delete set null,
  name               text not null,
  avatar_url         text,
  bio                text,
  rating             numeric(3,2) default 0,
  review_count       integer default 0,
  experience_years   integer default 0,
  languages          text[] default '{}',
  trips_completed    integer default 0,
  badge_gov_id       boolean default false,
  badge_first_aid    boolean default false,
  badge_cooperative  boolean default false,
  badge_police_check boolean default false,
  created_at         timestamptz default now()
);

-- ── 3. Listings ───────────────────────────────────────────────
create table if not exists listings (
  id               uuid primary key default gen_random_uuid(),
  type             text check (type in ('trek', 'homestay', 'experience')) not null,
  title            text not null,
  slug             text unique not null,
  region           text not null,
  district         text not null,
  description      text,
  images           text[] default '{}',
  guide_id         uuid references guides(id) on delete set null,
  rating           numeric(3,2) default 0,
  review_count     integer default 0,
  difficulty       text check (difficulty in ('easy', 'moderate', 'hard', 'expert')),
  duration_days    integer,
  max_group_size   integer,
  max_altitude_m   integer,
  price_per_person numeric(10,2) not null,
  currency         text default 'USD',
  included         text[] default '{}',
  excluded         text[] default '{}',
  cultural_note    text,
  best_months      text[] default '{}',
  tags             text[] default '{}',
  is_hidden_gem    boolean default false,
  is_featured      boolean default false,
  latitude         numeric(9,6),
  longitude        numeric(9,6),
  created_at       timestamptz default now()
);

-- ── 4. Reviews ────────────────────────────────────────────────
create table if not exists reviews (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid references listings(id) on delete cascade not null,
  user_id          uuid references profiles(id) on delete set null,
  traveler_name    text not null,
  traveler_country text,
  rating           integer check (rating between 1 and 5) not null,
  comment          text,
  avatar_url       text,
  review_date      text,
  created_at       timestamptz default now()
);

-- ── 5. Bookings ───────────────────────────────────────────────
create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  booking_ref      text unique not null default 'NEP-' || upper(substr(gen_random_uuid()::text, 1, 6)),
  listing_id       uuid references listings(id) on delete set null,
  user_id          uuid references profiles(id) on delete set null,
  date_from        date,
  date_to          date,
  num_adults       integer default 1,
  num_children     integer default 0,
  addons           text[] default '{}',
  payment_method   text,
  message_to_host  text,
  include_insurance boolean default false,
  base_total       numeric(10,2) default 0,
  addons_total     numeric(10,2) default 0,
  platform_fee     numeric(10,2) default 0,
  insurance_fee    numeric(10,2) default 0,
  grand_total      numeric(10,2) default 0,
  status           text check (status in ('pending','confirmed','cancelled','completed')) default 'confirmed',
  created_at       timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security
-- ══════════════════════════════════════════════════════════════

alter table profiles  enable row level security;
alter table guides    enable row level security;
alter table listings  enable row level security;
alter table reviews   enable row level security;
alter table bookings  enable row level security;

-- Profiles: read by self, write by self
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Guides: public read, insert/update only for admins (or via service role in future)
create policy "guides_select" on guides for select using (true);
create policy "guides_insert" on guides for insert with check (true);
create policy "guides_update" on guides for update using (true);

-- Listings: public read, insert/update by authenticated users (will tighten later)
create policy "listings_select" on listings for select using (true);
create policy "listings_insert" on listings for insert with check (auth.uid() is not null);
create policy "listings_update" on listings for update using (auth.uid() is not null);

-- Reviews: public read, insert by authenticated users
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (auth.uid() is not null);

-- Bookings: only visible to owner
create policy "bookings_select" on bookings for select using (auth.uid() = user_id);
create policy "bookings_insert" on bookings for insert with check (auth.uid() = user_id);
create policy "bookings_update" on bookings for update using (auth.uid() = user_id);
