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
| 2 | 거래 글 CRUD — 등록·목록·상세·수정·삭제, 이미지 업로드, 판매 상태, 검색/카테고리 | ✅ 완료 |
| 3 | 찜하기 (하트) + 카드에 찜·채팅 아이콘 표시 | ✅ 완료 |
| 4 | 이웃과 1:1 채팅 | ⬜ |
| 5 | 마이페이지 (내 판매 목록, 프로필 수정) | ⬜ |

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
- 고구마마켓: `public.ggm_profiles`, `public.ggm_products`, (앞으로) `ggm_likes`, `ggm_chats` …
- Storage 버킷도 마찬가지로 `ggm-products`

Auth(`auth.users`)는 두 서비스가 공유하지만, 가계부는 로그인을 쓰지 않으므로 충돌하지 않습니다.

배포는 서로 다른 Vercel 프로젝트(다른 도메인)로 따로 하면 됩니다.

---

## 폴더 구조

```
app/
  layout.tsx                 공통 레이아웃 (헤더/푸터)
  page.tsx                   홈 (히어로 + 최신 매물 8개)
  globals.css                Tailwind + 고구마 디자인 토큰
  (auth)/
    layout.tsx               로그인·회원가입 공통 껍데기
    login/page.tsx
    signup/page.tsx
  auth/
    actions.ts               signUp / signIn / signOut 서버 액션
    callback/route.ts        이메일 인증 링크 착지점
  products/
    page.tsx                 목록 + 검색 + 카테고리 필터
    actions.ts               create / update / delete / status 서버 액션
    [id]/page.tsx            상세
    [id]/edit/page.tsx       수정
  write/page.tsx             등록 (로그인 필요)
components/                  Header, Footer, ProductCard, ProductForm …
lib/
  categories.ts              카테고리 목록
  format.ts                  가격·상대시간·이미지 URL
  types.ts                   Product 타입
  supabase/client.ts         브라우저용 클라이언트
  supabase/server.ts         서버 컴포넌트/액션용 클라이언트
  supabase/middleware.ts     세션 자동 갱신 + 접근 제어
middleware.ts                위 updateSession 을 전역에 연결
supabase/migrations/         적용한 SQL 기록
```

### 거래 글이 저장되는 흐름

1. `/write` 폼에서 사진을 고르면 **브라우저가 직접** Supabase Storage로 업로드
   (`<user_id>/<uuid>.png` — 첫 폴더가 본인 uid일 때만 쓸 수 있게 정책이 걸려 있음)
2. 업로드된 **경로**만 서버 액션에 넘겨서 `ggm_products.images` 배열에 저장
3. 화면에 보여줄 때는 `lib/format.ts`의 `imageUrl()`이 공개 URL로 조립
4. 글을 수정하며 사진을 빼면 Storage에서도 같이 지운다 (삭제도 동일)

RLS 덕분에 남의 글은 **서버 액션을 직접 호출해도** 수정·삭제되지 않습니다.

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

---

## 샘플 데이터

구경할 거리가 있도록 판매자 3명과 상품 10개를 넣어뒀습니다. 모두 **비밀번호는 `goguma1234`**.

| 닉네임 | 이메일 | 동네 |
| --- | --- | --- |
| 감자대장 | `gamja@example.com` | 고구마동 |
| 호박여사 | `hobak@example.com` | 밤고구마동 |
| 당근이네 | `danggeun@example.com` | 호박고구마동 |

이 계정으로 로그인하면 해당 판매자의 글을 수정·삭제해 볼 수 있습니다.
전부 지우려면:

```sql
delete from public.ggm_products
 where seller_id in (
   select id from public.ggm_profiles
    where email in ('gamja@example.com','hobak@example.com','danggeun@example.com')
 );
```

(Storage에 올라간 샘플 이미지는 대시보드의 `ggm-products` 버킷에서 지우면 됩니다.)
