import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, timeAgo } from '@/lib/format'
import { STATUS_LABEL, type ProductWithSeller } from '@/lib/types'
import { ProductGallery } from '@/components/ProductGallery'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusSelect } from '@/components/StatusSelect'
import { DeleteProductButton } from '@/components/DeleteProductButton'
import { ProductCard } from '@/components/ProductCard'

const SELECT = '*, seller:ggm_profiles(nickname, region)'

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ggm_products')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle<ProductWithSeller>()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  return { title: product?.title ?? '상품' }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: auth }] = await Promise.all([
    supabase.from('ggm_products').select(SELECT).eq('id', id).maybeSingle<ProductWithSeller>(),
    supabase.auth.getUser(),
  ])

  if (!product) notFound()

  const user = auth.user
  const isOwner = user?.id === product.seller_id

  // 내 글을 내가 보는 건 조회수에 넣지 않는다.
  // RPC가 올린 뒤의 값을 돌려주므로 화면에도 바로 반영된다.
  let viewCount = product.view_count
  if (!isOwner) {
    const { data: newCount } = await supabase.rpc('ggm_increment_view', { p_id: id })
    if (typeof newCount === 'number') viewCount = newCount
  }

  // 같은 판매자의 다른 물건
  const { data: others } = await supabase
    .from('ggm_products')
    .select(SELECT)
    .eq('seller_id', product.seller_id)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(4)

  const sellerName = product.seller?.nickname ?? '알 수 없음'

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-8">
      <div className="grid gap-10 md:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <ProductGallery images={product.images ?? []} title={product.title} />

        <div className="flex flex-col">
          {/* 판매자 */}
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ggm-100 text-[17px] font-bold text-ggm-600">
              {sellerName.slice(0, 1)}
            </div>
            <div>
              <p className="text-[15px] font-bold text-neutral-900">{sellerName}</p>
              <p className="text-[13px] text-neutral-400">{product.region}</p>
            </div>
          </div>

          {/* 제목 / 가격 */}
          <div className="py-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={product.status} />
              <h1 className="text-[22px] font-bold leading-snug text-neutral-900">
                {product.title}
              </h1>
            </div>

            <p className="mt-1.5 text-[13px] text-neutral-400">
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:underline"
              >
                {product.category}
              </Link>
              {' · '}
              {timeAgo(product.created_at)}
            </p>

            <p className="mt-4 text-[24px] font-extrabold text-neutral-900">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* 설명 */}
          <p className="whitespace-pre-wrap border-t border-neutral-100 py-6 text-[15px] leading-[1.75] text-neutral-700">
            {product.description || '설명이 없어요.'}
          </p>

          <p className="text-[13px] text-neutral-400">조회 {viewCount}회</p>

          {/* 액션 */}
          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-6">
            {isOwner ? (
              <>
                <StatusSelect id={product.id} status={product.status} />
                <Link
                  href={`/products/${product.id}/edit`}
                  className="flex h-10 items-center rounded-lg border border-neutral-200 px-3.5 text-[14px] font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  수정
                </Link>
                <DeleteProductButton id={product.id} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  title="다음 단계에서 만들 예정이에요"
                  className="flex h-12 flex-1 items-center justify-center rounded-lg bg-neutral-200 px-5 text-[15px] font-bold text-neutral-400"
                >
                  채팅하기 (준비 중)
                </button>
                {!user && (
                  <Link href={`/login?next=/products/${product.id}`} className="btn-outline flex-1">
                    로그인하고 문의하기
                  </Link>
                )}
              </>
            )}
          </div>

          {product.status !== 'selling' && (
            <p className="mt-3 text-[13px] text-neutral-400">
              이 상품은 현재 <b>{STATUS_LABEL[product.status]}</b> 상태예요.
            </p>
          )}
        </div>
      </div>

      {/* 같은 판매자의 다른 물건 */}
      {others && others.length > 0 && (
        <section className="mt-16 border-t border-neutral-100 pt-8">
          <h2 className="text-[18px] font-bold text-neutral-900">
            {sellerName}님의 판매 물품
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {(others as ProductWithSeller[]).map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
