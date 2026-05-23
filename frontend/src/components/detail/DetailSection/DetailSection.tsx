import type { ReactNode } from 'react'
import { appStyles } from '../../../design'

type DetailSectionProps = {
  title: string
  eyebrow?: string
  description?: string
  children: ReactNode
}

function DetailSection({
  title,
  eyebrow,
  description,
  children,
}: DetailSectionProps) {
  return (
    <section className={appStyles.card.base}>
      <div className="mb-6">
        {eyebrow && (
          <p className={`mb-2 ${appStyles.text.eyebrow}`}>
            {eyebrow}
          </p>
        )}

        <h2 className={appStyles.text.sectionTitle}>{title}</h2>

        {description && (
          <p className={`mt-2 max-w-[760px] ${appStyles.text.body}`}>
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

export default DetailSection