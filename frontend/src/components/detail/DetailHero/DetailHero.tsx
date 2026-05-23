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
    <section className="mb-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div>
          {eyebrow && (
            <p className={`mb-3 ${appStyles.text.eyebrow}`}>
              {eyebrow}
            </p>
          )}

          <h1 className="max-w-[720px] font-serif text-[clamp(46px,6vw,78px)] leading-[0.98] tracking-[-0.035em] text-[#111111]">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-[680px] text-[19px] leading-relaxed text-[#2f3328]">
              {description}
            </p>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>

        <div className="hidden lg:block">
          {visual ?? (
            <div className="h-[360px] rounded-[28px] border border-[#eadfce] bg-[linear-gradient(135deg,#fff7ec,#f2dfc8)]" />
          )}
        </div>
      </div>
    </section>
  )
}

export default DetailHero