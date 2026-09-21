/**
 * Supabase 접속 정보를 한 곳에서 읽는다.
 *
 * 왜 이렇게 복잡한가?
 *  - 내 PC(.env.local)와 Vercel이 **변수 이름을 다르게** 쓴다.
 *    Vercel에서 Supabase 연동을 켜면 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
 *    `SUPABASE_URL` 같은 이름이 자동으로 들어온다.
 *  - 그래서 "알 만한 이름을 순서대로 뒤져보고 먼저 찾은 걸 쓴다".
 *
 * ⚠️ 반드시 지킬 것
 *  Next.js는 빌드할 때 `process.env.NEXT_PUBLIC_XXX` 라고 **글자 그대로 적힌 곳만**
 *  실제 값으로 바꿔치기한다. 그래서 아래처럼 이름을 하나씩 다 써야 한다.
 *  `process.env['NEXT_PUBLIC_' + name]` 같이 조립하면 브라우저에서 값이 빈다.
 */

/** Supabase 프로젝트 주소 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''

/** 브라우저에 노출돼도 되는 공개 키 (publishable = 예전 이름 anon) */
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''

/** 둘 다 들어왔는지 */
export function hasSupabaseEnv() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

/**
 * 값이 없으면 "무엇을 어디에 넣어야 하는지"까지 적힌 에러를 낸다.
 * (그냥 두면 Supabase 라이브러리가 영어로 한 줄만 뱉고 끝나서 원인 찾기가 어렵다)
 */
export function assertSupabaseEnv() {
  if (hasSupabaseEnv()) return

  const missing: string[] = []
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL (또는 SUPABASE_URL)')
  if (!SUPABASE_KEY) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)')

  throw new Error(
    `[고구마마켓] Supabase 환경 변수가 없습니다: ${missing.join(', ')}\n` +
      '· 로컬이라면 프로젝트 루트의 .env.local 을 확인하세요.\n' +
      '· Vercel이라면 Settings > Environment Variables 에 Production 으로 넣고,\n' +
      '  반드시 Deployments > Redeploy (Build Cache 끄고) 로 다시 빌드해야 값이 반영됩니다.'
  )
}

/**
 * 이메일 인증 링크가 되돌아올 주소.
 * Vercel에서는 VERCEL_PROJECT_PRODUCTION_URL 이 자동으로 들어오므로
 * 따로 설정하지 않아도 동작한다. (이 함수는 서버에서만 쓴다)
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`

  return 'http://localhost:3000'
}
