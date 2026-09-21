'use client'

import { useActionState } from 'react'
import { signInAction, type AuthState } from '@/app/auth/actions'
import { FormAlert } from './FormAlert'

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signInAction, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

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
        <label className="label" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

      <button type="submit" className="btn-primary mt-1" disabled={pending}>
        {pending ? '로그인 중…' : '로그인'}
      </button>
    </form>
  )
}
