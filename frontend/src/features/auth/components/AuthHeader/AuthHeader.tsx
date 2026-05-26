type AuthHeaderProps = {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-10 mt-2">
      <h1 className="text-3xl font-semibold tracking-tight text-[#2f4a31] mb-2">
        {title}
      </h1>
      <p className="text-[#706b60] text-sm">{subtitle}</p>
    </div>
  )
}
