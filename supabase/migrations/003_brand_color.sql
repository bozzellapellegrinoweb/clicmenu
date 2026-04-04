alter table public.businesses
  add column if not exists brand_color text not null default '#10b981';
