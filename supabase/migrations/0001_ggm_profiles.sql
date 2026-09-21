-- 고구마마켓(GGM) 1단계: 회원 프로필
-- 가계부(public.entries)와 같은 DB를 쓰므로 모든 테이블에 ggm_ 접두사를 붙인다.
-- ※ 이 파일은 이미 Supabase 프로젝트(vrkgrwpfuskcjqbdtihz)에 적용되어 있습니다. 기록용.

create table if not exists public.ggm_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null,
  email       text,
  avatar_url  text,
  region      text not null default '고구마동',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ggm_profiles_nickname_len check (char_length(nickname) between 2 and 20)
);

comment on table public.ggm_profiles is '고구마마켓 사용자 프로필. auth.users와 1:1.';

create unique index if not exists ggm_profiles_nickname_key
  on public.ggm_profiles (lower(nickname));

alter table public.ggm_profiles enable row level security;

drop policy if exists "ggm_profiles_select_all" on public.ggm_profiles;
create policy "ggm_profiles_select_all"
  on public.ggm_profiles for select
  using (true);

drop policy if exists "ggm_profiles_insert_own" on public.ggm_profiles;
create policy "ggm_profiles_insert_own"
  on public.ggm_profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "ggm_profiles_update_own" on public.ggm_profiles;
create policy "ggm_profiles_update_own"
  on public.ggm_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.ggm_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ggm_profiles_touch_updated_at on public.ggm_profiles;
create trigger ggm_profiles_touch_updated_at
  before update on public.ggm_profiles
  for each row execute function public.ggm_touch_updated_at();

-- 회원가입(auth.users insert) 시 프로필 자동 생성
create or replace function public.ggm_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ggm_profiles (id, nickname, email, region)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nickname', ''),
      '고구마' || substr(replace(new.id::text, '-', ''), 1, 6)
    ),
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'region', ''), '고구마동')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ggm_on_auth_user_created on auth.users;
create trigger ggm_on_auth_user_created
  after insert on auth.users
  for each row execute function public.ggm_handle_new_user();
