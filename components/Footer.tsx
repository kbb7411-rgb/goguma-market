import { SweetPotato } from './SweetPotato'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-100 bg-neutral-50">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-3 px-5 py-10 text-[13px] text-neutral-400">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <SweetPotato className="h-5 w-5 text-ggm-400" />
          <span className="font-bold">고구마마켓</span>
        </div>
        <p>당신 근처의 중고 직거래 마켓 · 개발 공부용 토이 프로젝트</p>
        <p>© {new Date().getFullYear()} GogumaMarket</p>
      </div>
    </footer>
  )
}
