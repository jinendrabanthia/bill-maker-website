-- Run this script in your Supabase SQL Editor

-- 1. Create profiles table
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Buyer (Your Company) Info
  buyer_name text,
  buyer_city text,
  buyer_mobile text,

  -- Supplier Info
  supplier_brand text,
  supplier_address text,
  supplier_phone text,
  supplier_email text,
  supplier_gstin text,
  supplier_website text,

  -- Default Settings
  default_agency text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint profiles_user_id_key unique (user_id)
);

-- 2. Create orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  ref_name text,
  agency text,
  order_form_no text,
  order_date date,
  advance_payment numeric default 0,
  advance_mode text default 'None',
  remark text,

  total_qty int,
  grand_total numeric,

  created_at timestamptz default now()
);

-- 3. Create order_items table
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,

  serial_no int,
  product_image_url text,
  code text,
  qty int default 1,
  net_price numeric,
  sizes text,
  no_of_sizes int,
  grand_total numeric
);

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 5. Create RLS Policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = user_id);

-- 6. Create RLS Policies for orders
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert own orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own orders" on orders
  for update using (auth.uid() = user_id);

create policy "Users can delete own orders" on orders
  for delete using (auth.uid() = user_id);

-- 7. Create RLS Policies for order_items
-- For order items, the owner of the order should have access.
create policy "Users can view own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can update own order items" on order_items
  for update using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can delete own order items" on order_items
  for delete using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- 8. Setup Storage Bucket
-- You must run this if the bucket doesn't exist. Alternatively, create it via UI.
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage RLS
create policy "Anyone can view product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Users can update their own product images"
  on storage.objects for update
  using ( bucket_id = 'product-images' and auth.uid() = owner );

create policy "Users can delete their own product images"
  on storage.objects for delete
  using ( bucket_id = 'product-images' and auth.uid() = owner );
