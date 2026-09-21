import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_KEY, SUPABASE_URL, hasSupabaseEnv } from '@/lib/env'

/** 로그인해야만 들어갈 수 있는 경로 */
const PROTECTED_PREFIXES = ['/mypage', '/write', '/chat']

/** 이미 로그인했다면 들어갈 필요가 없는 경로 */
const GUEST_ONLY_PREFIXES = ['/login', '/signup']

/**
 * 매 요청마다 만료된 access token을 갱신하고, 새 쿠키를 응답에 심는다.
 * 이 과정이 없으면 서버 컴포넌트가 만료된 세션을 보게 된다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // 환경 변수가 없으면 여기서 던지지 않고 그냥 통과시킨다.
  // 미들웨어는 모든 요청의 입구라, 여기서 터지면 사이트 전체가 500(MIDDLEWARE_INVOCATION_FAILED)이 되고
  // 진짜 원인이 뭔지 화면에 아무것도 안 남는다. 페이지 쪽에서 제대로 된 메시지를 내도록 넘긴다.
  if (!hasSupabaseEnv()) {
    console.error(
      '[고구마마켓] Supabase 환경 변수가 없어 로그인 세션 갱신을 건너뜁니다. ' +
        'Vercel > Settings > Environment Variables 를 확인한 뒤 Redeploy 하세요.'
    )
    return supabaseResponse
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 중요: createServerClient와 getUser() 사이에 다른 코드를 넣지 말 것.
  // 세션 갱신 타이밍이 어긋나 로그아웃이 반복될 수 있다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && GUEST_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
