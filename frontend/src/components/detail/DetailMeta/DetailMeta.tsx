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
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="flex h-[74px] min-w-[150px] items-center gap-3 rounded-[14px] border border-[#eadfce] bg-[#fffdf8] px-4"
          >
            {item.icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#d07a12]">
                {item.icon}
              </div>
            )}

            <div>
              <strong className="block text-[15px] leading-tight text-[#111111]">
                {item.value}
              </strong>
              <span className="mt-1 block text-xs text-[#706b60]">
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