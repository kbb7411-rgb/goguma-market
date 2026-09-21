'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { deleteProductAction } from '@/app/products/actions'

export function DeleteProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-10 rounded-lg px-3 text-[14px] font-semibold text-neutral-500 transition hover:bg-neutral-50 hover:text-red-600"
      >
        삭제
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-neutral-500">정말 삭제할까요?</span>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-10 rounded-lg px-3 text-[14px] font-semibold text-neutral-500 transition hover:bg-neutral-50"
      >
        취소
      </button>
      <form action={deleteProductAction}>
        <input type="hidden" name="id" value={id} />
        <SubmitDelete />
      </form>
    </div>
  )
}

function SubmitDelete() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-lg bg-red-500 px-3.5 text-[14px] font-bold text-white transition hover:bg-red-600 disabled:bg-neutral-300"
    >
      {pending ? '삭제 중…' : '삭제하기'}
    </button>
  )
}
