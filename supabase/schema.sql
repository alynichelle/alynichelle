
-- ===== INTEGRATIONS / PLUGINS =====
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                  -- 'square' | 'google' | 'apple_ics' | 'notion' | 'custom_ics'
  label text,                          -- human label like "Google (alyssa@gmail)"
  config jsonb default '{}'::jsonb,    -- stores tokens or ics_url, calendarId, etc.
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table integrations enable row level security;
create policy "owner manage integrations" on integrations
  for all using (true) with check (true);

-- Individual calendar sources (usually ICS). We import BUSY blocks from them.
create table if not exists calendar_sources (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references integrations(id) on delete cascade,
  kind text not null,                 -- 'ics' | 'google' | 'notion' | 'square'
  name text,
  ics_url text,                       -- for ICS-based sources (Apple, Google public link, Notion export, etc.)
  is_active boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);
alter table calendar_sources enable row level security;
create policy "owner manage calendar_sources" on calendar_sources
  for all using (true) with check (true);

-- Mark availability block source
alter table if exists availability_blocks
  add column if not exists source text; -- 'manual' | 'ics:...'

-- ===== STORAGE BUCKET (run once if not created) =====
-- In UI: Storage → New bucket 'client-files' (private: false is OK for MVP if using signed URLs only)
-- Or SQL (uncomment to create via SQL if needed):
-- select storage.create_bucket('client-files', public := false);

-- === BASE TABLES ===
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  dob date,
  stripe_customer_id text,
  default_payment_method_id text,
  created_at timestamp with time zone default now()
);
alter table if exists clients add column if not exists address_line1 text;
alter table if exists clients add column if not exists address_line2 text;
alter table if exists clients add column if not exists city text;
alter table if exists clients add column if not exists state text;
alter table if exists clients add column if not exists postal_code text;
alter table if exists clients add column if not exists dob date;
alter table if exists clients add column if not exists stripe_customer_id text;
alter table if exists clients add column if not exists default_payment_method_id text;

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
  client_id uuid references clients(id) on delete set null,
  client_name text not null,
  client_phone text,
  service_id text not null,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  notes text,
  deposit_cents int not null default 0,
  created_at timestamp with time zone default now()
);
alter table if exists bookings add column if not exists client_id uuid references clients(id) on delete set null;

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

-- === NEW TABLES / COLUMNS FOR INTAKE + BILLING + FORMS ===
-- (existing tables above kept)
-- This patch adds payments, discounts, calendar, availability, cancellations, disputes.

-- Bookings: add status & cancellation flags
alter table bookings add column if not exists status text default 'scheduled';         -- scheduled | completed | canceled
alter table bookings add column if not exists canceled_at timestamp with time zone;
alter table bookings add column if not exists cancellation_reason text;
-- Artist on the booking (single-provider default)
alter table bookings add column if not exists artist_name text default 'Alyssa Collins';
alter table bookings add column if not exists provider_id uuid; -- optional future multi-provider

-- Providers (owner/staff profiles)
create table if not exists providers (
  id uuid primary key default gen_random_uuid(), name text not null, bio text, photo_url text, specialties text[], is_active boolean default true, created_at timestamptz default now()
);
alter table providers enable row level security;
create policy "anon read providers" on providers for select using (true);
create policy "auth manage providers"
  on providers for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Availability blocks (your work hours or breaks)
create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  title text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_blocked boolean default false,   -- true = block time (no bookings)
  created_at timestamptz default now()
);
alter table availability_blocks enable row level security;
create policy "anon read avail" on availability_blocks for select using (true);
create policy "anon write avail" on availability_blocks for insert with check (true);
create policy "anon update avail" on availability_blocks for update using (true) with check (true);
create policy "anon delete avail" on availability_blocks for delete using (true);

-- Calendar “events” view (bookings + blocks) can be built in app; optional table below if you want separate notes:
create table if not exists calendar_notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz default now()
);
alter table calendar_notes enable row level security;
create policy "anon read notes" on calendar_notes for select using (true);
create policy "anon write notes" on calendar_notes for insert with check (true);
create policy "anon update notes" on calendar_notes for update using (true) with check (true);
create policy "anon delete notes" on calendar_notes for delete using (true);

-- Cancellation requests (client asks; you approve/deny)
create table if not exists cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  requested_at timestamptz default now(),
  reason text,
  status text default 'pending'       -- pending | approved | denied
);
alter table cancellation_requests enable row level security;
create policy "anon read cancel" on cancellation_requests for select using (true);
create policy "anon write cancel" on cancellation_requests for insert with check (true);
create policy "anon update cancel" on cancellation_requests for update using (true) with check (true);

-- Settings (late cancel window & fee)
create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  late_cancel_hours int default 48,
  late_cancel_fee_cents int default 2500,
  auto_charge_enabled boolean default false,
  auto_block_external boolean default true
);
alter table if exists business_settings add column if not exists auto_charge_enabled boolean default false;
alter table if exists business_settings add column if not exists auto_block_external boolean default true;
alter table business_settings enable row level security;
create policy "anon read settings" on business_settings for select using (true);
create policy "anon write settings" on business_settings for insert with check (true);
create policy "anon update settings" on business_settings for update using (true) with check (true);

-- Discounts & coupons
create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,       -- e.g., BRAT10
  kind text not null,              -- percent | fixed
  amount int not null,             -- percent (e.g., 10) or fixed cents (e.g., 500)
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions int,
  redemptions int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table discounts enable row level security;
create policy "anon read discounts" on discounts for select using (true);
create policy "anon write discounts" on discounts for insert with check (true);

-- Invoices & payments
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  service_id text,
  service_name text,
  artist_name text,
  subtotal_cents int not null default 0,
  discount_code text,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  status text default 'open',      -- open | paid | partially_paid | void
  created_at timestamptz default now()
);
alter table invoices enable row level security;
create policy "anon read invoices" on invoices for select using (true);
create policy "anon write invoices" on invoices for insert with check (true);
create policy "anon update invoices" on invoices for update using (true) with check (true);

-- Payment records (split payments supported via multiple rows per invoice)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  method text not null,            -- cash | card | credit
  amount_cents int not null,
  stripe_payment_intent_id text,   -- if card
  note text,
  created_at timestamptz default now()
);
alter table payments enable row level security;
create policy "anon read payments" on payments for select using (true);
create policy "anon write payments" on payments for insert with check (true);

-- Disputes tracking (manual log + status)
create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  opened_at timestamptz default now(),
  channel text,                    -- stripe | cash | credit
  reason text,
  status text default 'open',      -- open | won | lost | refunded
  notes text
);
alter table disputes enable row level security;
create policy "anon read disputes" on disputes for select using (true);
create policy "anon write disputes" on disputes for insert with check (true);
create policy "anon update disputes" on disputes for update using (true) with check (true);

-- Staff roles
create table if not exists staff_roles (
  user_id uuid primary key,       -- supabase auth user id
  role text not null default 'staff' -- 'owner' | 'staff'
);
alter table staff_roles enable row level security;
create policy "staff read" on staff_roles for select using (true);
create policy "owner write" on staff_roles for insert with check (true);
create policy "owner update" on staff_roles for update using (true) with check (true);

-- Legal forms and acceptances
create table if not exists legal_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_md text,
  version int default 1,
  is_active boolean default true,
  is_required boolean default false,
  created_at timestamptz default now()
);

create table if not exists client_form_acceptances (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  form_id uuid references legal_forms(id) on delete cascade,
  form_version int not null,
  accepted_name text,
  accepted_checkbox boolean default false,
  signature_png_url text,
  created_at timestamptz default now()
);

alter table legal_forms enable row level security;
alter table client_form_acceptances enable row level security;
create policy "anon read forms" on legal_forms for select using (true);
create policy "anon write forms" on legal_forms for insert with check (true);
create policy "anon update forms" on legal_forms for update using (true) with check (true);
create policy "anon read accepts" on client_form_acceptances for select using (true);
create policy "anon write accepts" on client_form_acceptances for insert with check (true);
create policy "anon update accepts" on client_form_acceptances for update using (true) with check (true);

-- Client payment methods (optional card-on-file tracking)
create table if not exists client_payment_methods (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  stripe_payment_method_id text,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table client_payment_methods enable row level security;
create policy "anon read pm" on client_payment_methods for select using (true);
create policy "anon write pm" on client_payment_methods for insert with check (true);
create policy "anon update pm" on client_payment_methods for update using (true) with check (true);

-- Helper view: clients with demographics completeness (MVP rule)
create or replace view clients_demographics_ok as
select
  c.*,
  (c.name is not null and c.phone is not null and c.email is not null
   and c.address_line1 is not null and c.city is not null
   and c.state is not null and c.postal_code is not null and c.dob is not null) as demographics_complete
from clients c;

-- STORAGE POLICIES (replace 'auth.uid() is not null' with role checks later if desired)
-- Allow authenticated users to upload to client folder; deny listing; generate signed URLs in app
create policy if not exists "uploads to client-files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'client-files');
create policy if not exists "read own client-files via signed url only" on storage.objects
  for select to authenticated
  using (bucket_id = 'client-files');
