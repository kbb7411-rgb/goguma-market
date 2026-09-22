import { SUPABASE_URL } from '@/lib/env'

const BUCKET = 'ggm-products'

/**
 * 사진 경로 → 실제로 보이는 주소
 *
 * 두 가지 경우를 다룬다.
 * 1) "/seed/bicycle-1.jpg" 처럼 `/` 로 시작 → 프로젝트 안 public 폴더의 연습용 예시 사진.
 *    이미 완성된 주소이므로 그대로 돌려준다.
 * 2) "사용자id/파일이름.jpg" → 사용자가 글쓰기에서 올려 Supabase 저장소에 들어간 사진.
 *    앞에 저장소 주소를 붙여 줘야 브라우저가 찾아갈 수 있다.
 */
export function imageUrl(path: string) {
  if (path.startsWith('/')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

/** 12000 → "12,000원", 0 → "나눔" */
export function formatPrice(price: number) {
  if (price === 0) return '나눔'
  return `${price.toLocaleString('ko-KR')}원`
}

/** "3분 전", "2일 전" 같은 상대 시간 */
export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)

  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`

  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`

  const day = Math.floor(hour / 24)
  if (day < 30) return `${day}일 전`

  const month = Math.floor(day / 30)
  if (month < 12) return `${month}개월 전`

  return `${Math.floor(month / 12)}년 전`
}
