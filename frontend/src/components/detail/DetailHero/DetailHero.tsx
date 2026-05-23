import type { ReactNode } from 'react'
import { appStyles } from '../../../design'

type DetailHeroProps = {
  eyebrow?: string
  title: string
  description?: string | null
  visual?: ReactNode
  children?: ReactNode
}

function DetailHero({
  eyebrow,
  title,
  description,
  visual,
  children,
}: DetailHeroProps) {
  return (
    <section className="mb-12">
      <div
        className={
          visual
            ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start'
            : 'max-w-[1120px]'
        }
      >
        <div>
          {eyebrow && (
            <p className={`mb-4 ${appStyles.text.eyebrow}`}>
              {eyebrow}
            </p>
          )}

          <h1 className="max-w-[980px] font-serif text-[clamp(48px,6.5vw,82px)] leading-[0.96] tracking-[-0.04em] text-[#111111]">
            {title}
          </h1>

          {description && (
            <p className="mt-6 max-w-[820px] text-[21px] leading-relaxed text-[#2f3328]">
              {description}
            </p>
          )}

          {children && <div className="mt-9">{children}</div>}
        </div>

        {visual && (
          <div className="hidden lg:block">
            {visual}
          </div>
        )}
      </div>
    </section>
  )
}

export default DetailHero