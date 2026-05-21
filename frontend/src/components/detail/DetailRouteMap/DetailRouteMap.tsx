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
  durationMin?: number | null
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
  locked: 'bg-sand-100 text-brown-500',
  available: 'bg-forest-50 text-forest-700',
  completed: 'bg-forest-100 text-forest-800',
  current: 'bg-forest-600 text-white',
}

function formatDuration(durationMin?: number | null) {
  if (!durationMin) {
    return null
  }

  return `${durationMin} min`
}

function DetailRouteMap({
  items,
  emptyMessage = 'Ni elementov za prikaz poti.',
}: DetailRouteMapProps) {
  if (items.length === 0) {
    return <p className="text-sm text-brown-500">{emptyMessage}</p>
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
        const duration = formatDuration(item.durationMin)
        const isCurrent = item.status === 'current'

        return (
          <li
            key={item.id}
            className={[
              'rounded-2xl border bg-sand-50 p-4 transition',
              isCurrent
                ? 'border-forest-600 ring-2 ring-forest-100'
                : 'border-sand-200',
            ].join(' ')}
          >
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forest-600 text-sm font-bold text-white">
                {order}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-brown-900">
                    {item.title}
                  </h3>

                  {item.typeLabel && (
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-brown-600">
                      {item.typeLabel}
                    </span>
                  )}

                  {item.isRequired !== undefined && (
                    <span className="rounded-full bg-sand-100 px-2 py-1 text-xs font-medium text-brown-600">
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
                  <p className="mt-2 text-sm leading-6 text-brown-600">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-brown-500">
                  {duration && (
                    <span className="rounded-full bg-white px-2 py-1">
                      Trajanje: {duration}
                    </span>
                  )}

                  {item.parallelGroup !== undefined &&
                    item.parallelGroup !== null && (
                      <span className="rounded-full bg-white px-2 py-1">
                        Paralelna skupina: {item.parallelGroup}
                      </span>
                    )}

                  {item.prerequisites && item.prerequisites.length > 0 && (
                    <span className="rounded-full bg-white px-2 py-1">
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