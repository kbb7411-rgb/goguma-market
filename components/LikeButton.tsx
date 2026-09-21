'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toggleLikeAction } from '@/app/products/actions'
import { HeartIcon } from './icons'

type Props = {
  productId: string
  /** 내가 이미 찜했는지 (서버가 알려준 값) */
  liked: boolean
  count: number
  /** sm = 목록 카드, lg = 상세 페이지 */
  size?: 'sm' | 'lg'
}

export function LikeButton({ productId, liked, count, size = 'sm' }: Props) {
  // 서버 응답을 기다리지 않고 화면부터 바꾼다(낙관적 업데이트).
  const [state, setState] = useState({ liked, count })
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  // 서버가 새 값을 내려주면 그걸 정답으로 삼는다.
  useEffect(() => setState({ liked, count }), [liked, count])

  function handleClick(e: React.MouseEvent) {
    // 카드 전체가 링크인 곳에서도 하트만 눌리도록 막는다.
    e.preventDefault()
    e.stopPropagation()

    const before = { liked, count }
    setState((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }))

    startTransition(async () => {
      const res = await toggleLikeAction(productId)
      if (res.needLogin) {
        setState(before)
        router.push(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      if (!res.ok) setState(before) // 실패하면 원래대로 되돌린다
    })
  }

  if (size === 'lg') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={state.liked}
        aria-label={state.liked ? '찜 취소' : '찜하기'}
        className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-lg border transition ${
          state.liked
            ? 'border-ggm-200 bg-ggm-50 text-ggm-500'
            : 'border-neutral-200 text-neutral-400 hover:text-ggm-500'
        }`}
      >
        <HeartIcon className="h-6 w-6" filled={state.liked} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={state.liked}
      aria-label={state.liked ? '찜 취소' : '찜하기'}
      className={`flex items-center gap-1 rounded-md px-1 py-0.5 text-[13px] transition ${
        state.liked ? 'text-ggm-500' : 'text-neutral-400 hover:text-ggm-500'
      }`}
    >
      <HeartIcon className="h-[15px] w-[15px]" filled={state.liked} />
      <span className="tabular-nums">{state.count}</span>
    </button>
  )
}
