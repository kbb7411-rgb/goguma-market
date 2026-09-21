'use client'

import { updateStatusAction } from '@/app/products/actions'
import { STATUS_LABEL, type ProductStatus } from '@/lib/types'

/** 판매자만 보는 상태 변경 셀렉트. 고르면 바로 저장된다. */
export function StatusSelect({ id, status }: { id: string; status: ProductStatus }) {
  return (
    <form action={updateStatusAction}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        // 저장 후 서버가 새 상태를 내려주면 select를 새로 마운트해서
        // 화면 값이 이전 값으로 남아 있지 않게 한다.
        key={status}
        defaultValue={status}
        aria-label="판매 상태"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-[14px] font-bold text-neutral-700 focus:border-ggm-500 focus:outline-none"
      >
        {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
