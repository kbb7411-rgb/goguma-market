import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SweetPotato } from '@/components/SweetPotato'

const STEPS = [
  { emoji: '📝', title: '중고 물품 등록', desc: '사진과 가격을 올려 동네에 내놓기', done: false },
  { emoji: '🔍', title: '동네 매물 둘러보기', desc: '카테고리·지역별로 찾아보기', done: false },
  { emoji: '💬', title: '이웃과 채팅', desc: '실시간으로 거래 약속 잡기', done: false },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
        <div className="mx-auto grid max-w-[1024px] items-center gap-10 px-5 py-16 sm:py-24 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            {user ? (
              <span className="w-fit rounded-full bg-ggm-100 px-3 py-1 text-[13px] font-bold text-ggm-600">
                {nickname ?? '이웃'}님, 오늘도 좋은 거래 되세요 🍠
              </span>
            ) : (
              <span className="w-fit rounded-full bg-ggm-100 px-3 py-1 text-[13px] font-bold text-ggm-600">
                우리 동네 중고 직거래
              </span>
            )}

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
              {user ? (
                <Link
                  href="/#next"
                  className="flex h-12 items-center rounded-lg bg-ggm-500 px-6 text-[15px] font-bold text-white transition hover:bg-ggm-600"
                >
                  동네 매물 보기
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="flex h-12 items-center rounded-lg bg-ggm-500 px-6 text-[15px] font-bold text-white transition hover:bg-ggm-600"
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/login"
                    className="flex h-12 items-center rounded-lg border border-neutral-200 bg-white px-6 text-[15px] font-bold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 일러스트 자리 */}
          <div className="relative hidden justify-self-center md:flex">
            <div className="flex h-[280px] w-[280px] items-center justify-center rounded-full bg-ggm-100">
              <SweetPotato className="h-40 w-40 text-ggm-500 drop-shadow-sm" />
            </div>
            <span className="absolute -right-2 top-4 rounded-2xl rounded-bl-md bg-white px-4 py-2 text-[14px] font-semibold text-neutral-700 shadow-md">
              고구마 한 박스 나눔해요!
            </span>
            <span className="absolute -left-4 bottom-8 rounded-2xl rounded-br-md bg-yam-500 px-4 py-2 text-[14px] font-bold text-white shadow-md">
              지금 갈게요 🙌
            </span>
          </div>
        </div>
      </section>

      {/* 다음 단계 안내 */}
      <section id="next" className="mx-auto max-w-[1024px] scroll-mt-20 px-5 py-16">
        <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
          다음은 이런 걸 만들 거예요
        </h2>
        <p className="mt-2 text-[15px] text-neutral-500">
          1단계 회원가입 · 로그인은 완성됐어요. 하나씩 이어서 붙여 나갑니다.
        </p>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-2xl border border-ggm-200 bg-ggm-50 p-5">
            <div className="text-[22px]">✅</div>
            <h3 className="mt-3 text-[16px] font-bold text-ggm-700">회원가입 · 로그인</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-ggm-600">
              Supabase Auth + 프로필 테이블 연동 완료
            </p>
          </li>
          {STEPS.map((s) => (
            <li key={s.title} className="rounded-2xl border border-neutral-100 bg-white p-5">
              <div className="text-[22px] opacity-60">{s.emoji}</div>
              <h3 className="mt-3 text-[16px] font-bold text-neutral-800">{s.title}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-neutral-500">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
