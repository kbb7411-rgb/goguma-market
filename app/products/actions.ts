'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isCategory } from '@/lib/categories'
import type { ProductStatus } from '@/lib/types'

export type ProductFormState = {
  error?: string
}

const BUCKET = 'ggm-products'

type ParsedInput = {
  title: string
  description: string
  price: number
  category: string
  region: string
  images: string[]
}

/** 폼 값을 검증해서 DB에 넣을 형태로 바꾼다. 문제가 있으면 문자열(에러 메시지)을 돌려준다. */
function parseForm(formData: FormData, userId: string): ParsedInput | string {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const region = String(formData.get('region') ?? '').trim() || '고구마동'
  const rawPrice = String(formData.get('price') ?? '').replace(/[,\s]/g, '')

  if (title.length < 2 || title.length > 60) return '제목은 2~60자로 입력해 주세요.'
  if (!isCategory(category)) return '카테고리를 선택해 주세요.'
  if (description.length > 2000) return '설명은 2000자까지 쓸 수 있어요.'

  const price = rawPrice === '' ? 0 : Number(rawPrice)
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000_000)
    return '가격은 0원 이상 10억원 이하의 숫자로 입력해 주세요.'

  let images: string[] = []
  try {
    const parsed = JSON.parse(String(formData.get('images') ?? '[]'))
    if (Array.isArray(parsed)) images = parsed.filter((p): p is string => typeof p === 'string')
  } catch {
    return '사진 정보를 읽지 못했어요. 다시 시도해 주세요.'
  }

  if (images.length > 10) return '사진은 최대 10장까지 올릴 수 있어요.'
  // 남의 폴더 경로를 끼워 넣지 못하도록 막는다.
  if (images.some((p) => !p.startsWith(`${userId}/`))) return '사진 경로가 올바르지 않아요.'

  return { title, description, price, category, region, images }
}

// ---------------------------------------------------------------- 등록

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const parsed = parseForm(formData, user.id)
  if (typeof parsed === 'string') return { error: parsed }

  const { data, error } = await supabase
    .from('ggm_products')
    .insert({ ...parsed, seller_id: user.id })
    .select('id')
    .single()

  if (error) return { error: `등록에 실패했어요: ${error.message}` }

  revalidatePath('/')
  revalidatePath('/products')
  redirect(`/products/${data.id}`)
}

// ---------------------------------------------------------------- 수정

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: '잘못된 요청이에요.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const parsed = parseForm(formData, user.id)
  if (typeof parsed === 'string') return { error: parsed }

  // 지워진 사진은 Storage에서도 치운다.
  const { data: before } = await supabase
    .from('ggm_products')
    .select('images')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('ggm_products')
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', user.id) // RLS와 별개로 한 번 더 확인

  if (error) return { error: `수정에 실패했어요: ${error.message}` }

  const removed = (before?.images ?? []).filter((p: string) => !parsed.images.includes(p))
  if (removed.length) await supabase.storage.from(BUCKET).remove(removed)

  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  redirect(`/products/${id}`)
}

// ---------------------------------------------------------------- 삭제

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('ggm_products')
    .select('images, seller_id')
    .eq('id', id)
    .single()

  if (!product || product.seller_id !== user.id) redirect(`/products/${id}`)

  const { error } = await supabase
    .from('ggm_products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) redirect(`/products/${id}?error=delete`)

  if (product.images?.length) await supabase.storage.from(BUCKET).remove(product.images)

  revalidatePath('/')
  revalidatePath('/products')
  redirect('/products')
}

// ---------------------------------------------------------------- 상태 변경

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as ProductStatus

  if (!id || !['selling', 'reserved', 'sold'].includes(status)) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('ggm_products')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', user.id)

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
}
