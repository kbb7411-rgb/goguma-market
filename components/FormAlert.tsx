export function FormAlert({ tone, children }: { tone: 'error' | 'notice'; children: React.ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-red-100 bg-red-50 text-red-600'
      : 'border-ggm-100 bg-ggm-50 text-ggm-700'

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-[13.5px] leading-relaxed ${styles}`}
    >
      {children}
    </p>
  )
}
