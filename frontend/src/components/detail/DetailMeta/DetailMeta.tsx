import type { ReactNode } from 'react'
import { appStyles } from '../../../design'

export type DetailMetaItem = {
  label: string
  value: string | number
  icon?: ReactNode
}

type DetailMetaProps = {
  items: DetailMetaItem[]
  variant?: 'cards' | 'compact'
}

function DetailMeta({ items, variant = 'cards' }: DetailMetaProps) {
  if (items.length === 0) {
    return null
  }

 if (variant === 'compact') {
  return (
    <div className="grid gap-3 lg:flex lg:flex-wrap lg:gap-4">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="flex min-h-[72px] w-full items-center gap-3 rounded-[14px] border border-[#eadfce] bg-[#fffdf8] px-4 py-3 lg:h-[86px] lg:w-auto lg:min-w-[175px] lg:gap-4 lg:rounded-[16px] lg:px-5 lg:py-0"
        >
          {item.icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#d07a12] [&_svg]:h-6 [&_svg]:w-6 lg:h-12 lg:w-12 lg:[&_svg]:h-7 lg:[&_svg]:w-7">
              {item.icon}
            </div>
          )}

          <div className="min-w-0">
            <strong className="block break-words text-[17px] font-bold leading-tight text-[#111111] lg:text-[20px]">
              {item.value}
            </strong>

            <span className="mt-1 block text-[13px] font-semibold text-[#706b60] lg:text-[14px]">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className={appStyles.card.soft}>
          {item.icon && (
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eee4] text-[#31583b]">
              {item.icon}
            </div>
          )}

          <span className="text-sm text-[#7b766c]">{item.label}</span>

          <strong className={`mt-1 block ${appStyles.text.green}`}>
            {item.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

export default DetailMeta