-- ── Menu views ───────────────────────────────────────────────────────────
create table public.menu_views (
  id          uuid        primary key default uuid_generate_v4(),
  business_id uuid        not null references public.businesses(id) on delete cascade,
  viewed_at   timestamptz not null default now()
);

create index menu_views_business_date on public.menu_views (business_id, viewed_at desc);

-- RLS: chiunque può inserire (menu pubblico), solo il proprietario può leggere
alter table public.menu_views enable row level security;

create policy "Public can insert views"
  on public.menu_views for insert
  with check (true);

create policy "Owner can read own views"
  on public.menu_views for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

-- ── Item photo clicks ─────────────────────────────────────────────────────
create table public.item_clicks (
  id          uuid        primary key default uuid_generate_v4(),
  item_id     uuid        not null references public.items(id) on delete cascade,
  business_id uuid        not null references public.businesses(id) on delete cascade,
  clicked_at  timestamptz not null default now()
);

create index item_clicks_business_date on public.item_clicks (business_id, clicked_at desc);
create index item_clicks_item          on public.item_clicks (item_id);

alter table public.item_clicks enable row level security;

create policy "Public can insert clicks"
  on public.item_clicks for insert
  with check (true);

create policy "Owner can read own clicks"
  on public.item_clicks for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

-- ── Google Review URL ─────────────────────────────────────────────────────
alter table public.businesses
  add column if not exists google_review_url text;
