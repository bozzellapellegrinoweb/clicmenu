-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================================
-- BUSINESSES
-- ================================================================
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'restaurant',
  slug text not null unique,
  logo_url text,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "Users can manage their own businesses"
  on public.businesses for all
  using (auth.uid() = user_id);

create policy "Public can read businesses by slug"
  on public.businesses for select
  using (true);

-- ================================================================
-- MENUS
-- ================================================================
create table public.menus (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.menus enable row level security;

create policy "Users can manage menus of their businesses"
  on public.menus for all
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "Public can read published menus"
  on public.menus for select
  using (is_published = true);

-- ================================================================
-- CATEGORIES
-- ================================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Users can manage categories of their menus"
  on public.categories for all
  using (
    menu_id in (
      select m.id from public.menus m
      join public.businesses b on m.business_id = b.id
      where b.user_id = auth.uid()
    )
  );

create policy "Public can read categories of published menus"
  on public.categories for select
  using (
    menu_id in (select id from public.menus where is_published = true)
  );

-- ================================================================
-- ITEMS
-- ================================================================
create table public.items (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  currency text not null default 'EUR',
  photo_url text,
  tags text[] not null default '{}',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "Users can manage items of their categories"
  on public.items for all
  using (
    category_id in (
      select c.id from public.categories c
      join public.menus m on c.menu_id = m.id
      join public.businesses b on m.business_id = b.id
      where b.user_id = auth.uid()
    )
  );

create policy "Public can read items of published menus"
  on public.items for select
  using (
    category_id in (
      select c.id from public.categories c
      join public.menus m on c.menu_id = m.id
      where m.is_published = true
    )
  );

-- ================================================================
-- SUBSCRIPTIONS
-- ================================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'trialing',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
insert into storage.buckets (id, name, public) values ('menu-photos', 'menu-photos', true);
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

create policy "Users can upload their menu photos"
  on storage.objects for insert
  with check (bucket_id = 'menu-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view menu photos"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

create policy "Users can upload their logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id in ('menu-photos', 'logos') and auth.uid()::text = (storage.foldername(name))[1]);
