export const CATEGORIES = [
  '디지털기기',
  '생활가전',
  '가구/인테리어',
  '생활/주방',
  '유아동',
  '의류',
  '뷰티/미용',
  '스포츠/레저',
  '취미/게임/음반',
  '도서',
  '반려동물용품',
  '식물',
  '기타 중고물품',
  '나눔',
] as const

export type Category = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}
