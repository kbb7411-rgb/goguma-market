'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import { imageUrl } from '@/lib/format'
import type { Product } from '@/lib/types'
import type { ProductFormState } from '@/app/products/actions'
import { FormAlert } from './FormAlert'

const BUCKET = 'ggm-products'
const MAX_IMAGES = 10
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type Props = {
  userId: string
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>
  /** 수정 모드일 때만 전달 */
  product?: Product
}

export function ProductForm({ userId, action, product }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {})

  // 이미 올라가 있는 사진(Storage 경로) / 이번에 새로 고른 파일을 따로 관리한다.
  const [keptPaths, setKeptPaths] = useState<string[]>(product?.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const total = keptPaths.length + newFiles.length
  const busy = pending || uploading

  // 미리보기 URL은 만들었으면 반드시 해제해야 메모리가 새지 않는다.
  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = '' // 같은 파일을 다시 고를 수 있게 초기화
    if (!picked.length) return

    for (const f of picked) {
      if (!ALLOWED.includes(f.type)) return setLocalError('jpg, png, webp, gif 만 올릴 수 있어요.')
      if (f.size > MAX_BYTES) return setLocalError('사진 한 장은 5MB까지 올릴 수 있어요.')
    }
    if (total + picked.length > MAX_IMAGES)
      return setLocalError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`)

    setLocalError(null)
    setNewFiles((prev) => [...prev, ...picked])
  }

  async function uploadNewFiles() {
    const supabase = createClient()
    const paths: string[] = []

    for (const file of newFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
      if (error) throw new Error(error.message)
      paths.push(path)
    }
    return paths
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // 서버 액션을 부르기 전에 사진부터 Storage에 올려야 하므로 직접 가로챈다.
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setLocalError(null)
    setUploading(true)
    try {
      const uploaded = await uploadNewFiles()
      formData.set('images', JSON.stringify([...keptPaths, ...uploaded]))
      // 업로드까지 끝났으니 새 파일 목록은 비운다(재제출 시 중복 업로드 방지).
      setKeptPaths([...keptPaths, ...uploaded])
      setNewFiles([])
    } catch (err) {
      setLocalError(`사진 업로드에 실패했어요: ${(err as Error).message}`)
      setUploading(false)
      return
    }
    setUploading(false)
    startTransition(() => formAction(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {product && <input type="hidden" name="id" value={product.id} />}

      {/* ---------------------------------------------------------- 사진 */}
      <section>
        <p className="label">
          상품 이미지{' '}
          <span className="font-normal text-neutral-400">
            ({total}/{MAX_IMAGES})
          </span>
        </p>

        <div className="flex flex-wrap gap-2.5">
          <label
            className="flex h-[88px] w-[88px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1
                       rounded-xl border border-dashed border-neutral-300 text-neutral-400
                       transition hover:border-ggm-400 hover:text-ggm-500"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a1 1 0 0 0 .84-.46l.72-1.1A1 1 0 0 1 9.1 4h5.8a1 1 0 0 1 .84.45l.72 1.1a1 1 0 0 0 .84.45h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z" />
              <circle cx="12" cy="12.5" r="3.2" />
            </svg>
            <span className="text-[12px] font-semibold">
              {total}/{MAX_IMAGES}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handlePick}
              disabled={busy || total >= MAX_IMAGES}
            />
          </label>

          {/* 이미 올라가 있는 사진 */}
          {keptPaths.map((path, i) => (
            <Thumb
              key={path}
              src={imageUrl(path)}
              isCover={i === 0}
              onRemove={() => setKeptPaths((p) => p.filter((x) => x !== path))}
              disabled={busy}
            />
          ))}

          {/* 이번에 새로 고른 사진 */}
          {previews.map((src, i) => (
            <Thumb
              key={src}
              src={src}
              isCover={keptPaths.length === 0 && i === 0}
              onRemove={() => setNewFiles((f) => f.filter((_, idx) => idx !== i))}
              disabled={busy}
            />
          ))}
        </div>
        <p className="mt-2 text-[13px] text-neutral-400">첫 번째 사진이 대표 이미지가 돼요.</p>
      </section>

      {/* ---------------------------------------------------------- 제목 */}
      <div>
        <label className="label" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          className="field"
          placeholder="상품명을 입력해 주세요"
          defaultValue={product?.title ?? ''}
          minLength={2}
          maxLength={60}
          required
        />
      </div>

      {/* ---------------------------------------------------------- 카테고리 */}
      <div>
        <label className="label" htmlFor="category">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          className="field"
          defaultValue={product?.category ?? ''}
          required
        >
          <option value="" disabled>
            카테고리를 선택해 주세요
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------------------------------------------------- 가격 */}
      <div>
        <label className="label" htmlFor="price">
          가격
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-neutral-400">
            ₩
          </span>
          <input
            id="price"
            name="price"
            className="field pl-9"
            inputMode="numeric"
            pattern="[0-9,]*"
            placeholder="0 을 입력하면 나눔이 돼요"
            defaultValue={product ? String(product.price) : ''}
          />
        </div>
      </div>

      {/* ---------------------------------------------------------- 동네 */}
      <div>
        <label className="label" htmlFor="region">
          거래 지역
        </label>
        <input
          id="region"
          name="region"
          className="field"
          placeholder="예) 고구마동"
          defaultValue={product?.region ?? '고구마동'}
          maxLength={20}
        />
      </div>

      {/* ---------------------------------------------------------- 설명 */}
      <div>
        <label className="label" htmlFor="description">
          자세한 설명
        </label>
        <textarea
          id="description"
          name="description"
          className="field min-h-[180px] resize-y py-3 leading-relaxed"
          placeholder={
            '올릴 게시글 내용을 작성해 주세요.\n(판매 금지 물품은 게시가 제한될 수 있어요)'
          }
          defaultValue={product?.description ?? ''}
          maxLength={2000}
        />
      </div>

      {/* images는 제출 직전에 handleSubmit이 채워 넣는다 */}
      <input type="hidden" name="images" defaultValue="[]" />

      {(localError || state?.error) && <FormAlert tone="error">{localError ?? state.error}</FormAlert>}

      <div className="flex gap-3">
        <Link
          href={product ? `/products/${product.id}` : '/products'}
          className="btn-outline flex-1"
          aria-disabled={busy}
        >
          취소
        </Link>
        <button type="submit" className="btn-primary flex-[2]" disabled={busy}>
          {uploading ? '사진 올리는 중…' : pending ? '저장 중…' : product ? '수정 완료' : '작성 완료'}
        </button>
      </div>
    </form>
  )
}

function Thumb({
  src,
  isCover,
  onRemove,
  disabled,
}: {
  src: string
  isCover: boolean
  onRemove: () => void
  disabled: boolean
}) {
  return (
    <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-neutral-100">
      {/* 미리보기는 blob: URL도 쓰므로 next/image 대신 img를 쓴다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />

      {isCover && (
        <span className="absolute bottom-0 left-0 right-0 bg-black/55 py-0.5 text-center text-[11px] font-bold text-white">
          대표
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="사진 삭제"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full
                   bg-black/55 text-[13px] leading-none text-white transition hover:bg-black/75"
      >
        ×
      </button>
    </div>
  )
}
