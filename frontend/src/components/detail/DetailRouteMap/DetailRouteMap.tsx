export type DetailRouteItemStatus =
  | 'locked'
  | 'available'
  | 'completed'
  | 'current'

export type DetailRouteItem = {
  id: string
  title: string
  description?: string | null
  typeLabel?: string
  durationLabel?: string | null
  order?: number | null
  parallelGroup?: string | number | null
  isRequired?: boolean
  prerequisites?: string[]
  status?: DetailRouteItemStatus
}

type DetailRouteMapProps = {
  items: DetailRouteItem[]
  emptyMessage?: string
}

const statusLabels: Record<DetailRouteItemStatus, string> = {
  locked: 'Zaklenjeno',
  available: 'Na voljo',
  completed: 'Opravljeno',
  current: 'Trenutno',
}

const statusClasses: Record<DetailRouteItemStatus, string> = {
  locked: 'bg-[rgba(123,118,108,0.12)] text-[#6d6a61]',
  available: 'bg-[rgba(219,210,195,0.5)] text-[#5f665d]',
  completed: 'bg-[rgba(47,74,49,0.12)] text-[#2f4a31]',
  current: 'bg-[#31583b] text-white',
}

function DetailRouteMap({
  items,
  emptyMessage = 'Ni elementov za prikaz poti.',
}: DetailRouteMapProps) {
  if (items.length === 0) {
    return <p className="text-sm text-[#706b60]">{emptyMessage}</p>
  }

  const sortedItems = [...items].sort((firstItem, secondItem) => {
    const firstOrder = firstItem.order ?? Number.MAX_SAFE_INTEGER
    const secondOrder = secondItem.order ?? Number.MAX_SAFE_INTEGER

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder
    }

    return firstItem.title.localeCompare(secondItem.title, 'sl')
  })

  return (
    <ol className="space-y-4">
      {sortedItems.map((item, index) => {
        const order = item.order ?? index + 1
        const isCurrent = item.status === 'current'

        return (
          <li
            key={item.id}
            className={[
              'rounded-[16px] border bg-[#f8f2e8] p-4 transition',
              isCurrent
                ? 'border-[#31583b] shadow-[0_0_0_3px_rgba(49,88,59,0.12)]'
                : 'border-[#ded5c6]',
            ].join(' ')}
          >
            <div className="flex gap-4">
              <div
                className={[
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  isCurrent
                    ? 'bg-[#31583b] text-white'
                    : 'bg-[#fffdf8] text-[#2f4a31]',
                ].join(' ')}
              >
                {order}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[#2f4a31]">
                    {item.title}
                  </h3>

                  {item.typeLabel && (
                    <span className="rounded-full bg-[#fffdf8] px-2 py-1 text-xs font-medium text-[#706b60]">
                      {item.typeLabel}
                    </span>
                  )}

                  {item.isRequired !== undefined && (
                    <span className="rounded-full bg-[#fffdf8] px-2 py-1 text-xs font-medium text-[#706b60]">
                      {item.isRequired ? 'Obvezno' : 'Izbirno'}
                    </span>
                  )}

                  {item.status && (
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-medium',
                        statusClasses[item.status],
                      ].join(' ')}
                    >
                      {statusLabels[item.status]}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-2 text-sm leading-6 text-[#5d5a55]">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#706b60]">
                  {item.durationLabel && (
                    <span className="rounded-full bg-[#fffdf8] px-2 py-1">
                      Trajanje: {item.durationLabel}
                    </span>
                  )}

                  {item.parallelGroup !== undefined &&
                    item.parallelGroup !== null && (
                      <span className="rounded-full bg-[#fffdf8] px-2 py-1">
                        Paralelna skupina: {item.parallelGroup}
                      </span>
                    )}

                  {item.prerequisites && item.prerequisites.length > 0 && (
                    <span className="rounded-full bg-[#fffdf8] px-2 py-1">
                      Predpogoji: {item.prerequisites.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default DetailRouteMap