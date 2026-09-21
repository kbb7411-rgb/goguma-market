import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { Wordmark } from './SweetPotato'

const NAV = [
  { href: '/', label: '중고거래' },
  { href: '/#soon', label: '동네업체' },
  { href: '/#soon', label: '알바' },
  { href: '/#soon', label: '부동산' },
]

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('ggm_profiles')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle()
    nickname = profile?.nickname ?? user.email?.split('@')[0] ?? '고구마'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1024px] items-center gap-7 px-5">
        <Link href="/" aria-label="고구마마켓 홈">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-[15px] transition hover:text-ggm-500 ${
                i === 0 ? 'font-bold text-neutral-900' : 'font-medium text-neutral-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-[14px] text-neutral-600 sm:inline">
                <b className="font-bold text-neutral-900">{nickname}</b>님
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-neutral-200 px-3.5 text-[14px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex h-9 items-center rounded-lg px-3.5 text-[14px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="flex h-9 items-center rounded-lg bg-ggm-500 px-3.5 text-[14px] font-bold text-white transition hover:bg-ggm-600"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
