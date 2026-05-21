type LogoProps = {
  label?: string
}

function Logo({ label = 'Psi-Up' }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-600 text-lg font-bold text-white">
        Ψ
      </div>
      <span className="font-display text-xl font-bold text-brown-900">
        {label}
      </span>
    </div>
  )
}

export default Logo