import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SweetPotato } from '@/components/SweetPotato'
import { ProductCard } from '@/components/ProductCard'
import { getLikedIds } from '@/lib/likes'
import type { ProductWithSeller } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: auth }, { data: latest }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('ggm_products')
      .select('*, seller:ggm_profiles!ggm_products_seller_id_fkey(nickname, region)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const user = auth.user
  const products = (latest ?? []) as ProductWithSeller[]
  const likedIds = await getLikedIds(products.map((p) => p.id))

  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('ggm_profiles')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle()
    nickname = profile?.nickname ?? null
  }

  return (
    <>
      {/* 히어로 */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1024px] items-center gap-10 px-5 py-16 sm:py-20 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="w-fit rounded-full bg-ggm-100 px-3 py-1 text-[13px] font-bold text-ggm-600">
              {user ? `${nickname ?? '이웃'}님, 오늘도 좋은 거래 되세요 🍠` : '우리 동네 중고 직거래'}
            </span>

            <h1 className="text-[34px] font-extrabold leading-[1.25] tracking-tight text-neutral-900 sm:text-[42px]">
              당신 근처의
              <br />
              <span className="text-ggm-500">고구마마켓</span>
            </h1>

            <p className="text-[16px] leading-relaxed text-neutral-500">
              동네 이웃과 직접 만나 따뜻하게 거래해요.
              <br className="hidden sm:block" />
              묻어둔 물건도 고구마처럼 캐내면 보물이 됩니다.
            </p>

            <div className="mt-2 flex gap-3">
              <Link
                href="/products"
                className="flex h-12 items-center rounded-lg bg-ggm-500 px-6 text-[15px] font-bold text-white transition hover:bg-ggm-600"
              >
                동네 매물 보기
              </Link>
              <Link
                href={user ? '/write' : '/login?next=/write'}
                className="flex h-12 items-center rounded-lg border border-neutral-200 bg-white px-6 text-[15px] font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                물건 팔기
              </Link>
            </div>
          </div>

          {/* 일러스트 */}
          <div className="relative hidden justify-self-center md:flex">
            <div className="flex h-[280px] w-[280px] items-center justify-center rounded-full bg-ggm-100">
              <SweetPotato className="h-40 w-40 text-ggm-500 drop-shadow-sm" />
            </div>
            <span className="absolute -right-2 top-4 rounded-2xl rounded-bl-md bg-white px-4 py-2 text-[14px] font-semibold text-neutral-700 shadow-md">
              고구마 한 박스 나눔해요!
            </span>
            <span className="absolute -left-6 bottom-6 rounded-2xl rounded-br-md bg-yam-500 px-4 py-2 text-[14px] font-bold text-white shadow-md">
              지금 갈게요 🙌
            </span>
          </div>
        </div>
      </section>

      {/* 최신 매물 */}
      <section className="mx-auto max-w-[1024px] px-5 py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
            따끈따끈한 중고 물건
          </h2>
          <Link href="/products" className="text-[14px] font-semibold text-neutral-500 hover:text-ggm-500">
            더 보기 →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
            <SweetPotato className="h-12 w-12 text-ggm-200" />
            <p className="text-[15px] text-neutral-500">
              아직 올라온 물건이 없어요. 첫 고구마를 캐볼까요?
            </p>
            <Link
              href={user ? '/write' : '/login?next=/write'}
              className="flex h-11 items-center rounded-lg bg-ggm-500 px-5 text-[15px] font-bold text-white transition hover:bg-ggm-600"
            >
              물건 팔기
            </Link>
          </div>
        ) : (
          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} liked={likedIds.has(p.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
