import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, imageUrl, timeAgo } from '@/lib/format'
import type { ProductWithSeller } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { SweetPotato } from './SweetPotato'
import { LikeButton } from './LikeButton'
import { ChatIcon } from './icons'

export function ProductCard({
  product,
  liked = false,
}: {
  product: ProductWithSeller
  /** 내가 찜한 글인지 */
  liked?: boolean
}) {
  const thumb = product.images?.[0]

  // 하트는 버튼이라 링크 안에 넣으면 안 된다(클릭이 겹치고 HTML 규칙에도 어긋남).
  // 그래서 링크와 아이콘 줄을 형제로 나란히 둔다.
  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
          {thumb ? (
            <Image
              src={imageUrl(thumb)}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={`object-cover transition duration-300 group-hover:scale-105 ${
                product.status === 'sold' ? 'opacity-45' : ''
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-ggm-50">
              <SweetPotato className="h-12 w-12 text-ggm-200" />
            </div>
          )}

          {product.status !== 'selling' && (
            <span className="absolute left-2 top-2">
              <StatusBadge status={product.status} />
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-col gap-0.5">
          <h3 className="line-clamp-2 text-[15px] leading-snug text-neutral-800">{product.title}</h3>
          <p className="text-[15px] font-bold text-neutral-900">{formatPrice(product.price)}</p>
          <p className="text-[13px] text-neutral-400">
            {product.region} · {timeAgo(product.created_at)}
          </p>
        </div>
      </Link>

      <div className="mt-1.5 flex items-center gap-2.5">
        <LikeButton productId={product.id} liked={liked} count={product.like_count ?? 0} />
        <span
          className="flex items-center gap-1 px-1 py-0.5 text-[13px] text-neutral-400"
          title="채팅은 다음 단계에서 만들어요"
        >
          <ChatIcon className="h-[15px] w-[15px]" />
          <span className="tabular-nums">0</span>
        </span>
      </div>
    </article>
  )
}
