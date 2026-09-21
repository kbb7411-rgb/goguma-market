import type { NextConfig } from 'next'

/*
 * 환경 변수 이름 맞추기
 *
 * Vercel의 Supabase 연동은 `SUPABASE_URL` 처럼 접두사 없는 이름도 만든다.
 * 접두사가 없으면 서버는 읽지만 **브라우저는 못 읽는다.**
 * (로그인·사진 업로드는 브라우저에서 하므로 반드시 브라우저에도 있어야 한다)
 *
 * 그래서 빌드할 때 여기서 값을 찾아 `NEXT_PUBLIC_...` 이름으로 넣어준다.
 * next.config 의 `env` 에 적은 값은 빌드 시점에 코드 안으로 그대로 박힌다.
 * → Vercel 설정을 바꾸지 않아도 어느 이름이든 동작한다.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''

/** 상품 사진을 불러올 도메인. Supabase 주소에서 뽑아 쓴다. */
function storageHost() {
  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return 'localhost' // 값이 없을 때 빌드가 깨지지 않도록
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '\n[고구마마켓] ⚠️ Supabase 환경 변수를 찾지 못했습니다.\n' +
      '  찾아본 이름: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL,\n' +
      '             NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY\n' +
      '  이대로 배포하면 화면이 뜨지 않습니다.\n'
  )
}

const nextConfig: NextConfig = {
  // 이름이 무엇이든, 브라우저에는 항상 이 두 이름으로 전달된다.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: storageHost(),
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
