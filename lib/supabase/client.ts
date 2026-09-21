import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_KEY, SUPABASE_URL, assertSupabaseEnv } from '@/lib/env'

/**
 * 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 클라이언트.
 * 세션은 쿠키에 저장되므로 서버 컴포넌트와 그대로 공유된다.
 */
export function createClient() {
  assertSupabaseEnv()
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
