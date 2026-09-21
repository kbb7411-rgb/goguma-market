import { createClient } from '@/lib/supabase/server'

/**
 * 지금 로그인한 사람이 찜한 글 id 목록.
 *
 * 목록 화면에서 글마다 따로 물어보면 느리므로, 보이는 글 id를 한 번에 넘겨
 * "이 중에 내가 찜한 게 뭐야?" 를 한 번만 물어본다.
 * (ggm_likes 는 RLS 때문에 애초에 내 것만 조회된다)
 */
export async function getLikedIds(productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data } = await supabase
    .from('ggm_likes')
    .select('product_id')
    .eq('user_id', user.id)
    .in('product_id', productIds)

  return new Set((data ?? []).map((row) => row.product_id as string))
}
