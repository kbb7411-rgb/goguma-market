export type ProductStatus = 'selling' | 'reserved' | 'sold'

export const STATUS_LABEL: Record<ProductStatus, string> = {
  selling: '판매중',
  reserved: '예약중',
  sold: '거래완료',
}

export type Product = {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category: string
  region: string
  status: ProductStatus
  images: string[]
  view_count: number
  created_at: string
  updated_at: string
}

/** 목록/상세에서 판매자 닉네임까지 같이 가져온 형태 */
export type ProductWithSeller = Product & {
  seller: { nickname: string; region: string } | null
}
