/** 고구마마켓 심볼. 당근마켓의 당근 자리에 들어가는 고구마 한 알. */
export function SweetPotato({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* 고구마 몸통 */}
      <path
        d="M13 49.5C5.5 42.5 9 27 22.5 16.5 34 7.5 48.5 5.5 55 12.5c6.5 7 2 22.5-11.5 32.5C32 53.5 19.5 55.5 13 49.5Z"
        fill="currentColor"
      />
      {/* 속살 하이라이트 */}
      <path
        d="M20 43c-3.5-3.5-1.5-12 6-18.5S42 15 45 18.5"
        stroke="var(--color-yam-400)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* 껍질 결 */}
      <circle cx="26" cy="38" r="1.8" fill="var(--color-ggm-800)" opacity="0.45" />
      <circle cx="36" cy="30" r="1.6" fill="var(--color-ggm-800)" opacity="0.45" />
      <circle cx="45" cy="34" r="1.5" fill="var(--color-ggm-800)" opacity="0.35" />
      {/* 새싹 */}
      <path
        d="M52 13c2.5-4 7-5.5 9.5-4 1.5 3-1 7.5-5.5 9"
        fill="var(--color-yam-500)"
        opacity="0.95"
      />
    </svg>
  )
}

/** 심볼 + 워드마크 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <SweetPotato className="h-8 w-8 text-ggm-500" />
      <span className="text-[19px] font-extrabold tracking-tight text-ggm-500">고구마마켓</span>
    </span>
  )
}
