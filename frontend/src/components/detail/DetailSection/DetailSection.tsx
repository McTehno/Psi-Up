import type { ReactNode } from 'react'

type DetailSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-brown-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-3xl text-brown-600">{description}</p>
        )}
      </div>

      {children}
    </section>
  )
}

export default DetailSection