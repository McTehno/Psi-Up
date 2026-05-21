import type { ReactNode } from 'react'

type DetailHeroProps = {
  eyebrow?: string
  title: string
  description?: string | null
  children?: ReactNode
}

function DetailHero({ eyebrow, title, description, children }: DetailHeroProps) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-600">
          {eyebrow}
        </p>
      )}

      <h1 className="font-display text-4xl font-bold leading-tight text-brown-900 md:text-5xl">
        {title}
      </h1>

      {description && (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-brown-600">
          {description}
        </p>
      )}

      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}

export default DetailHero