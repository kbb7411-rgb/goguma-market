import type { Metadata } from 'next'
import Link from 'next/link'
import { SweetPotato } from '@/components/SweetPotato'
import { SignupForm } from '@/components/SignupForm'

export const metadata: Metadata = { title: '회원가입' }

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col items-center gap-3 text-center">
        <SweetPotato className="h-14 w-14 text-ggm-500" />
        <h1 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
          고구마마켓에 오신 걸 환영해요
        </h1>
        <p className="text-[14px] text-neutral-500">
          이메일만 있으면 30초 만에 가입할 수 있어요.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <SignupForm />
      </div>

      <p className="text-center text-[14px] text-neutral-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-bold text-ggm-500 underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
