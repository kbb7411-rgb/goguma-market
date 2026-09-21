'use client'

import Image from 'next/image'
import { useState } from 'react'
import { imageUrl } from '@/lib/format'
import { SweetPotato } from './SweetPotato'

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0)

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-ggm-50">
        <SweetPotato className="h-20 w-20 text-ggm-200" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={imageUrl(images[index])}
          alt={`${title} 사진 ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 460px"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`사진 ${i + 1} 보기`}
              aria-current={i === index}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index ? 'border-ggm-500' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={imageUrl(path)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
