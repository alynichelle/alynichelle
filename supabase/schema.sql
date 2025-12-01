-- Run in Supabase SQL editor
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamp with time zone default now()
);

create table if not exists client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  body text,
  created_at timestamp with time zone default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique not null,
  stock int not null default 0,
  cost_cents int not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text,
  service_id text not null,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  notes text,
  deposit_cents int not null default 0,
  created_at timestamp with time zone default now()
);

-- Basic RLS (allow anon read/write for MVP; tighten later)
alter table clients enable row level security;
alter table client_notes enable row level security;
alter table inventory enable row level security;
alter table bookings enable row level security;

create policy "anon read" on clients for select using (true);
create policy "anon write" on clients for insert with check (true);
create policy "anon read notes" on client_notes for select using (true);
create policy "anon write notes" on client_notes for insert with check (true);
create policy "anon read inv" on inventory for select using (true);
create policy "anon write inv" on inventory for insert with check (true);
create policy "anon upsert inv" on inventory for update using (true) with check (true);
create policy "anon read bookings" on bookings for select using (true);
create policy "anon write bookings" on bookings for insert with check (true);
