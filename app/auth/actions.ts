'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  /** 이메일 인증 안내처럼 에러가 아닌 메시지 */
  notice?: string
  /** 입력값 유지용 */
  values?: { email?: string; nickname?: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

/** Supabase 영문 에러 메시지를 한국어로 */
function translate(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않아요.'
  if (m.includes('email not confirmed')) return '아직 이메일 인증이 끝나지 않았어요. 메일함을 확인해 주세요.'
  if (m.includes('user already registered')) return '이미 가입된 이메일이에요.'
  if (m.includes('password should be at least')) return '비밀번호는 6자 이상이어야 해요.'
  if (m.includes('rate limit') || m.includes('too many')) return '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.'
  return message
}

/** 안전한 내부 경로만 허용 (오픈 리다이렉트 방지) */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

// ---------------------------------------------------------------- 회원가입

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const nickname = String(formData.get('nickname') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
  const values = { email, nickname }

  if (!EMAIL_RE.test(email)) return { error: '이메일 형식을 확인해 주세요.', values }
  if (nickname.length < 2 || nickname.length > 20)
    return { error: '닉네임은 2~20자로 입력해 주세요.', values }
  if (password.length < 6) return { error: '비밀번호는 6자 이상이어야 해요.', values }
  if (password !== passwordConfirm) return { error: '비밀번호가 서로 달라요.', values }

  const supabase = await createClient()

  // 닉네임은 DB에 unique 인덱스가 걸려 있지만, 먼저 확인해서 친절한 메시지를 준다.
  // ilike는 패턴 매칭이므로 %, _ 같은 와일드카드는 escape 한다.
  const pattern = nickname.replace(/[\\%_]/g, (c) => `\\${c}`)
  const { data: taken } = await supabase
    .from('ggm_profiles')
    .select('id')
    .ilike('nickname', pattern)
    .limit(1)
    .maybeSingle()

  if (taken) return { error: '이미 사용 중인 닉네임이에요.', values }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  })

  if (error) return { error: translate(error.message), values }

  // 이메일 인증이 켜져 있으면 세션 없이 사용자만 생성된다.
  if (!data.session) {
    return {
      notice: `${email} 으로 인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 완료됩니다.`,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// ---------------------------------------------------------------- 로그인

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = safeNext(formData.get('next'))

  if (!email || !password) return { error: '이메일과 비밀번호를 모두 입력해 주세요.', values: { email } }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: translate(error.message), values: { email } }

  revalidatePath('/', 'layout')
  redirect(next)
}

// ---------------------------------------------------------------- 로그아웃

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
