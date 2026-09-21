const BUCKET = 'ggm-products'

/** Storage 경로 → 공개 URL */
export function imageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`
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
