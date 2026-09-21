'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUpAction, type AuthState } from '@/app/auth/actions'
import { FormAlert } from './FormAlert'

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUpAction, {})

  // 인증 메일을 보낸 뒤에는 폼 대신 안내만 보여준다.
  if (state?.notice) {
    return (
      <div className="flex flex-col gap-5">
        <FormAlert tone="notice">{state.notice}</FormAlert>
        <Link href="/login" className="btn-outline">
          로그인 화면으로
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="label" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field"
          placeholder="goguma@example.com"
          autoComplete="email"
          defaultValue={state?.values?.email ?? ''}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="nickname">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          className="field"
          placeholder="이웃에게 보여질 이름 (2~20자)"
          autoComplete="nickname"
          minLength={2}
          maxLength={20}
          defaultValue={state?.values?.nickname ?? ''}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          placeholder="6자 이상"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="passwordConfirm">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          className="field"
          placeholder="한 번 더 입력해 주세요"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

      <button type="submit" className="btn-primary mt-1" disabled={pending}>
        {pending ? '가입 중…' : '고구마마켓 시작하기'}
      </button>
    </form>
  )
}
