-- Clients table
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  phone text,
  email text unique,
  home_address text,
  date_of_birth date,
  race_ethnicity text,
  current_medications text,
  is_pregnant boolean default false,
  is_breastfeeding boolean default false,
  card_token text,
  is_vip boolean default false,
  loyalty_points int default 0,
  loyalty_tier text default 'standard',
  created_at timestamp default current_timestamp
);

-- Service catalog
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  base_price numeric(10,2) not null,
  min_price numeric(10,2),
  default_duration_minutes int not null,
  category text,
  points_awarded int default 0,
  is_fill boolean default false,
  created_at timestamp default current_timestamp
);

-- Appointments table
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  requested_time timestamptz not null,
  duration_minutes int not null,
  status text default 'pending', -- pending, approved, denied, expired
  approval_expires_at timestamptz,
  created_at timestamp default current_timestamp
);

-- Services linked to appointments (multi-select)
create table if not exists appointment_services (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  service_id uuid references services(id),
  custom_price numeric(10,2),
  custom_duration_minutes int,
  quantity int default 1
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  client_id uuid references clients(id),
  subtotal numeric(10,2) not null,
  tax numeric(10,2) default 0,
  travel_fee numeric(10,2) default 0,
  tip numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'USD',
  created_at timestamp default current_timestamp
);

-- Invoice line items
create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  service_id uuid references services(id),
  description text,
  unit_price numeric(10,2) not null,
  quantity int default 1,
  line_total numeric(10,2) not null
);

-- Documents table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  title text,
  file_url text,
  type text,
  uploaded_at timestamp default current_timestamp
);

-- Messages table
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  sender text check (sender in ('client', 'admin')),
  content text,
  sent_at timestamp default current_timestamp
);

-- Payment methods (store Stripe IDs, not raw card data)
create table if not exists payment_methods (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  stripe_payment_method_id text not null,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  created_at timestamp default current_timestamp
);

-- Loyalty ledger for annual points
create table if not exists loyalty_transactions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  appointment_id uuid references appointments(id),
  points int not null,
  note text,
  occurred_at timestamp default current_timestamp
);
