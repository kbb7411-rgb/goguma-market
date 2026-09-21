-- 프로필의 이메일을 외부에 감춘다.
-- ※ 이미 적용되어 있습니다. 기록용.
--
-- 배경: ggm_profiles 는 판매자 닉네임을 보여줘야 해서 select 정책이 using(true) 다.
--       그런데 RLS는 '행' 단위라 칼럼은 못 가린다. 그래서 publishable 키만 있으면
--       누구나 가입 이메일을 읽을 수 있었다.
--
-- 함정: revoke select (email) ... 만 하면 효과가 없다.
--       테이블 전체 SELECT 권한이 이미 있으면 칼럼 하나만 회수해도 무시되기 때문.
--       전체를 회수하고 필요한 칼럼만 다시 부여해야 한다.

revoke select, update on public.ggm_profiles from anon, authenticated;

-- 공개 가능: 판매자 표시에 필요한 정보만
grant select (id, nickname, avatar_url, region, created_at, updated_at)
  on public.ggm_profiles to anon, authenticated;

-- 본인이 고칠 수 있는 칼럼 (어떤 행인지는 RLS 정책이 따로 제한한다)
grant update (nickname, avatar_url, region)
  on public.ggm_profiles to authenticated;

comment on column public.ggm_profiles.email is
  '가입 이메일. anon/authenticated는 읽을 수 없다(칼럼 권한으로 차단). 관리 목적으로만 사용.';

-- 주의: 앞으로 ggm_profiles 를 조회할 때 select('*') 를 쓰면 401 이 난다.
--       필요한 칼럼을 반드시 명시할 것. 예) select('nickname, region')
