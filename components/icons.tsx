type IconProps = { className?: string; filled?: boolean }

/** 찜 하트. filled = 찜한 상태 */
export function HeartIcon({ className = 'h-4 w-4', filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.9.9.9-.9a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z" />
    </svg>
  )
}

/** 채팅 말풍선 */
export function ChatIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 12a7.5 7.5 0 0 1-7.8 7.5c-1 0-2-.2-2.9-.5L4 20.5l1.5-4.6A7.5 7.5 0 1 1 20 12Z" />
    </svg>
  )
}
