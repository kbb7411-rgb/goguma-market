export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream">
      <div className="mx-auto w-full max-w-[400px] px-5 py-14 sm:py-20">{children}</div>
    </div>
  )
}
