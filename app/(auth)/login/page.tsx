import type { Metadata } from 'next'
import Link from 'next/link'
import { SweetPotato } from '@/components/SweetPotato'
import { LoginForm } from '@/components/LoginForm'
import { FormAlert } from '@/components/FormAlert'

export const metadata: Metadata = { title: '로그인' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col items-center gap-3 text-center">
        <SweetPotato className="h-14 w-14 text-ggm-500" />
        <h1 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
          다시 만나 반가워요!
        </h1>
        <p className="text-[14px] text-neutral-500">
          고구마마켓 계정으로 동네 이웃과 거래를 시작해요.
        </p>
      </div>

      {error === 'auth' && (
        <FormAlert tone="error">인증 링크가 만료되었거나 올바르지 않아요. 다시 시도해 주세요.</FormAlert>
      )}

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <LoginForm next={safeNext} />
      </div>

      <p className="text-center text-[14px] text-neutral-500">
        아직 회원이 아니신가요?{' '}
        <Link href="/signup" className="font-bold text-ggm-500 underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
