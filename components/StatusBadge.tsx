import { STATUS_LABEL, type ProductStatus } from '@/lib/types'

const TONE: Record<ProductStatus, string> = {
  selling: 'bg-ggm-500 text-white',
  reserved: 'bg-yam-500 text-white',
  sold: 'bg-neutral-500 text-white',
}

export function StatusBadge({
  status,
  className = '',
}: {
  status: ProductStatus
  className?: string
}) {
  // 판매중은 굳이 배지를 달지 않는다(당근마켓과 동일).
  if (status === 'selling') return null

  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[12px] font-bold ${TONE[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
