import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/ProductForm'
import { updateProductAction } from '@/app/products/actions'
import type { Product } from '@/lib/types'

export const metadata: Metadata = { title: '글 수정' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/products/${id}/edit`)

  const { data: product } = await supabase
    .from('ggm_products')
    .select('*')
    .eq('id', id)
    .maybeSingle<Product>()

  if (!product) notFound()
  // 남의 글은 수정할 수 없다(DB의 RLS와 별개로 화면에서도 막는다).
  if (product.seller_id !== user.id) redirect(`/products/${id}`)

  return (
    <div className="mx-auto max-w-[640px] px-5 py-10">
      <h1 className="mb-8 text-[24px] font-extrabold tracking-tight text-neutral-900">글 수정</h1>
      <ProductForm userId={user.id} action={updateProductAction} product={product} />
    </div>
  )
}
