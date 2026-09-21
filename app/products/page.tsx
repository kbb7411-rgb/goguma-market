import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, isCategory } from '@/lib/categories'
import { ProductCard } from '@/components/ProductCard'
import { SweetPotato } from '@/components/SweetPotato'
import type { ProductWithSeller } from '@/lib/types'

export const metadata: Metadata = { title: '중고거래' }

/** ilike 패턴에서 와일드카드를 escape */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const keyword = (q ?? '').trim()
  const activeCategory = category && isCategory(category) ? category : null

  const supabase = await createClient()

  let query = supabase
    .from('ggm_products')
    .select('*, seller:ggm_profiles(nickname, region)')
    .order('created_at', { ascending: false })
    .limit(60)

  if (activeCategory) query = query.eq('category', activeCategory)
  if (keyword) query = query.ilike('title', `%${escapeLike(keyword)}%`)

  const { data, error } = await query
  const products = (data ?? []) as ProductWithSeller[]

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[24px] font-extrabold tracking-tight text-neutral-900">
          {activeCategory ?? '중고거래'}
        </h1>

        {/* 검색 — 서버 컴포넌트라 GET 폼으로 처리한다 */}
        <form action="/products" method="get" className="flex w-full gap-2 sm:w-auto">
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          <input
            name="q"
            defaultValue={keyword}
            placeholder="어떤 물건을 찾으세요?"
            className="field h-10 flex-1 sm:w-[260px]"
            aria-label="상품 검색"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-neutral-100 px-4 text-[14px] font-bold text-neutral-700 transition hover:bg-neutral-200"
          >
            검색
          </button>
        </form>
      </div>

      {/* 카테고리 칩 */}
      <div className="-mx-5 mt-5 overflow-x-auto px-5 pb-1">
        <div className="flex w-max gap-2">
          <Chip href={buildHref(null, keyword)} active={!activeCategory}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} href={buildHref(c, keyword)} active={activeCategory === c}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-10 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[14px] text-red-600">
          목록을 불러오지 못했어요: {error.message}
        </p>
      )}

      {!error && products.length === 0 ? (
        <Empty keyword={keyword} category={activeCategory} />
      ) : (
        <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function buildHref(category: string | null, keyword: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (keyword) params.set('q', keyword)
  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition ${
        active
          ? 'bg-ggm-500 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      {children}
    </Link>
  )
}

function Empty({ keyword, category }: { keyword: string; category: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <SweetPotato className="h-14 w-14 text-ggm-200" />
      <p className="text-[15px] text-neutral-500">
        {keyword ? (
          <>
            <b className="text-neutral-800">&lsquo;{keyword}&rsquo;</b> 검색 결과가 없어요.
          </>
        ) : category ? (
          <>
            <b className="text-neutral-800">{category}</b>에 아직 올라온 물건이 없어요.
          </>
        ) : (
          '아직 올라온 물건이 없어요. 첫 번째 고구마를 캐볼까요?'
        )}
      </p>
      <Link
        href="/write"
        className="flex h-11 items-center rounded-lg bg-ggm-500 px-5 text-[15px] font-bold text-white transition hover:bg-ggm-600"
      >
        글쓰기
      </Link>
    </div>
  )
}
