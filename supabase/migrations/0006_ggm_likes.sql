-- 고구마마켓 3단계: 찜하기
-- ※ 이미 적용되어 있습니다. 기록용.

create table if not exists public.ggm_likes (
  user_id    uuid not null references public.ggm_profiles(id) on delete cascade,
  product_id uuid not null references public.ggm_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 한 사람이 같은 글을 두 번 찜할 수 없다 (복합 기본키)
  primary key (user_id, product_id)
);

comment on table public.ggm_likes is '고구마마켓 찜(관심) 목록. 누가 무엇을 찜했는지는 본인만 볼 수 있다.';

create index if not exists ggm_likes_product_idx on public.ggm_likes (product_id);

alter table public.ggm_likes enable row level security;

-- 내 찜만 보인다. (남이 무엇을 찜했는지는 알 필요가 없다)
drop policy if exists "ggm_likes_select_own" on public.ggm_likes;
create policy "ggm_likes_select_own"
  on public.ggm_likes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ggm_likes_insert_own" on public.ggm_likes;
create policy "ggm_likes_insert_own"
  on public.ggm_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ggm_likes_delete_own" on public.ggm_likes;
create policy "ggm_likes_delete_own"
  on public.ggm_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── 찜 개수 ──────────────────────────────────────────────────────────
-- 목록에서 글마다 찜 개수를 세면 느리고, 위 정책 때문에 남의 찜은 세지도 못한다.
-- 그래서 개수를 ggm_products 에 따로 적어두고 트리거로 자동 갱신한다.
alter table public.ggm_products
  add column if not exists like_count integer not null default 0;

create or replace function public.ggm_sync_like_count()
returns trigger
language plpgsql
security definer   -- ggm_products 는 글쓴이만 수정 가능하므로 관리자 권한으로 실행
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.ggm_products
       set like_count = like_count + 1
     where id = new.product_id;
    return new;
  else
    update public.ggm_products
       set like_count = greatest(like_count - 1, 0)
     where id = old.product_id;
    return old;
  end if;
end;
$$;

drop trigger if exists ggm_likes_sync_count on public.ggm_likes;
create trigger ggm_likes_sync_count
  after insert or delete on public.ggm_likes
  for each row execute function public.ggm_sync_like_count();

-- 혹시 어긋났을 때를 대비해 현재 값으로 한 번 맞춰둔다.
update public.ggm_products p
   set like_count = coalesce((select count(*) from public.ggm_likes l where l.product_id = p.id), 0);

-- ⚠️ 주의
-- ggm_likes 가 생기면서 ggm_products 와 ggm_profiles 사이 경로가 두 개(직접 FK, 찜 경유)가 됐다.
-- 그래서 판매자를 같이 가져올 때는 어느 관계인지 반드시 명시해야 한다:
--   select('*, seller:ggm_profiles!ggm_products_seller_id_fkey(nickname, region)')
