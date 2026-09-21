# 🍠 고구마마켓 (GogumaMarket)

당근마켓을 참고해 만드는 중고거래 웹서비스. **개발 공부용**으로 단계적으로 만들어 갑니다.

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Style**: Tailwind CSS v4
- **Auth / DB**: Supabase (가계부 프로젝트와 **같은 Supabase 프로젝트**를 공유)

---

## 진행 상황

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| 1 | 회원가입 / 로그인 / 로그아웃, 프로필 테이블 | ✅ 완료 |
| 2 | 중고 물품 등록 (이미지 업로드 포함) | ⬜ |
| 3 | 매물 목록 · 상세 · 카테고리/지역 필터 | ⬜ |
| 4 | 관심(찜), 채팅 | ⬜ |

---

## 시작하기

```bash
npm install
npm run dev
```

→ http://localhost:3000

`.env.local` 은 이미 채워져 있습니다. (`.env.example` 참고)

| 키 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable(anon) 키 — 브라우저에 노출돼도 되는 키 |
| `NEXT_PUBLIC_SITE_URL` | 이메일 인증 링크가 되돌아올 주소. 배포 시 실제 도메인으로 교체 |

---

## 가계부와 DB를 공유하는 방법

같은 Supabase 프로젝트를 쓰기 때문에 **테이블 이름이 겹치지 않도록 `ggm_` 접두사**를 붙입니다.

- 가계부: `public.entries`
- 고구마마켓: `public.ggm_profiles`, (앞으로) `ggm_products`, `ggm_chats` …

Auth(`auth.users`)는 두 서비스가 공유하지만, 가계부는 로그인을 쓰지 않으므로 충돌하지 않습니다.

배포는 서로 다른 Vercel 프로젝트(다른 도메인)로 따로 하면 됩니다.

---

## 폴더 구조

```
app/
  layout.tsx            공통 레이아웃 (헤더/푸터)
  page.tsx              홈
  globals.css           Tailwind + 고구마 디자인 토큰
  (auth)/
    layout.tsx          로그인·회원가입 공통 껍데기
    login/page.tsx
    signup/page.tsx
  auth/
    actions.ts          signUp / signIn / signOut 서버 액션
    callback/route.ts   이메일 인증 링크 착지점
components/             Header, Footer, 폼, 고구마 로고
lib/supabase/
  client.ts             브라우저용 클라이언트
  server.ts             서버 컴포넌트/액션용 클라이언트
  middleware.ts         세션 자동 갱신 + 접근 제어
middleware.ts           위 updateSession 을 전역에 연결
supabase/migrations/    적용한 SQL 기록
```

### 인증이 도는 흐름

1. 회원가입 → `supabase.auth.signUp()` → `auth.users` 에 row 생성
2. DB 트리거 `ggm_on_auth_user_created` 가 `ggm_profiles` 에 프로필을 자동 생성
3. 세션은 **쿠키**에 저장되어 서버 컴포넌트에서도 바로 읽힘
4. `middleware.ts` 가 매 요청마다 만료된 토큰을 갱신

### 로그인이 필요한 경로

`lib/supabase/middleware.ts` 의 `PROTECTED_PREFIXES` 배열에 경로를 추가하면 됩니다.
현재는 `/mypage`, `/write`, `/chat` (아직 만들지 않은 다음 단계용).

---

## Supabase 대시보드에서 확인할 것

**Authentication → Sign In / Providers → Email**

- `Confirm email` **켜짐(기본값)**: 가입 후 메일의 링크를 눌러야 로그인 가능
  → 공부하면서 빠르게 테스트하려면 **꺼두는 걸 추천**
- `Confirm email` 꺼짐: 가입 즉시 로그인됨

**Authentication → URL Configuration**

- `Site URL`: `http://localhost:3000`
- `Redirect URLs`: `http://localhost:3000/**` (배포 후 실제 도메인도 추가)

---

## 디자인 토큰

당근마켓의 레이아웃·여백 감각은 유지하고 브랜드 컬러만 고구마로 바꿨습니다.
`app/globals.css` 의 `@theme` 에서 수정할 수 있습니다.

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `ggm-500` | `#9a3f76` | 브랜드 메인 (자색고구마 껍질) |
| `yam-500` | `#f5a93c` | 포인트 (고구마 속살) |
| `cream` | `#fffaf4` | 배경 |
