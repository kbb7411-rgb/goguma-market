import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/ProductForm'
import { createProductAction } from '@/app/products/actions'

export const metadata: Metadata = { title: '중고거래 글쓰기' }

export default async function WritePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // middleware에서 이미 막지만, 페이지에서도 한 번 더 확인한다.
  if (!user) redirect('/login?next=/write')

  return (
    <div className="mx-auto max-w-[640px] px-5 py-10">
      <h1 className="mb-8 text-[24px] font-extrabold tracking-tight text-neutral-900">
        중고거래 글쓰기
      </h1>
      <ProductForm userId={user.id} action={createProductAction} />
    </div>
  )
}
