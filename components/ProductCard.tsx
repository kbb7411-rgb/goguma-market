import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, imageUrl, timeAgo } from '@/lib/format'
import type { ProductWithSeller } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { SweetPotato } from './SweetPotato'

export function ProductCard({ product }: { product: ProductWithSeller }) {
  const thumb = product.images?.[0]

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col">
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
  )
}
