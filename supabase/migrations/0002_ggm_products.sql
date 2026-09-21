-- 고구마마켓 2단계: 거래 글(중고 물품) CRUD
-- ※ 이미 Supabase 프로젝트(vrkgrwpfuskcjqbdtihz)에 적용되어 있습니다. 기록용.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ggm_product_status') then
    create type public.ggm_product_status as enum ('selling', 'reserved', 'sold');
  end if;
end
$$;

create table if not exists public.ggm_products (
  id          uuid primary key default gen_random_uuid(),
  -- ggm_profiles를 참조해야 PostgREST가 판매자 정보를 같이 가져올 수 있다.
  seller_id   uuid not null references public.ggm_profiles(id) on delete cascade,
  title       text not null,
  description text not null default '',
  price       integer not null default 0,
  category    text not null,
  region      text not null default '고구마동',
  status      public.ggm_product_status not null default 'selling',
  -- Storage 버킷 안의 경로 목록. 공개 URL은 앱에서 조립한다.
  images      text[] not null default '{}',
  view_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ggm_products_title_len check (char_length(title) between 2 and 60),
  constraint ggm_products_desc_len  check (char_length(description) <= 2000),
  constraint ggm_products_price_range check (price >= 0 and price <= 1000000000),
  constraint ggm_products_images_max check (array_length(images, 1) is null or array_length(images, 1) <= 10)
);

comment on table public.ggm_products is '고구마마켓 중고 거래 글.';

create index if not exists ggm_products_created_at_idx on public.ggm_products (created_at desc);
create index if not exists ggm_products_category_idx   on public.ggm_products (category);
create index if not exists ggm_products_seller_idx     on public.ggm_products (seller_id);

alter table public.ggm_products enable row level security;

-- 글은 누구나 볼 수 있다(비로그인 포함)
drop policy if exists "ggm_products_select_all" on public.ggm_products;
create policy "ggm_products_select_all"
  on public.ggm_products for select
  using (true);

-- 쓰기/수정/삭제는 글쓴이 본인만
drop policy if exists "ggm_products_insert_own" on public.ggm_products;
create policy "ggm_products_insert_own"
  on public.ggm_products for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "ggm_products_update_own" on public.ggm_products;
create policy "ggm_products_update_own"
  on public.ggm_products for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "ggm_products_delete_own" on public.ggm_products;
create policy "ggm_products_delete_own"
  on public.ggm_products for delete
  to authenticated
  using (auth.uid() = seller_id);

-- 조회수는 RLS를 우회해야 하므로 security definer 함수로 올린다.
create or replace function public.ggm_increment_view(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ggm_products set view_count = view_count + 1 where id = p_id;
$$;

revoke all on function public.ggm_increment_view(uuid) from public;
grant execute on function public.ggm_increment_view(uuid) to anon, authenticated;
