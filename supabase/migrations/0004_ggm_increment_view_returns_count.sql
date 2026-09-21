-- 조회수를 올린 뒤 '올라간 값'을 바로 돌려준다.
-- (안 그러면 상세 화면에 증가 전 숫자가 찍힌다)
-- ※ 이미 적용되어 있습니다. 기록용.

drop function if exists public.ggm_increment_view(uuid);

create function public.ggm_increment_view(p_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.ggm_products
     set view_count = view_count + 1
   where id = p_id
  returning view_count;
$$;

revoke all on function public.ggm_increment_view(uuid) from public;
grant execute on function public.ggm_increment_view(uuid) to anon, authenticated;
