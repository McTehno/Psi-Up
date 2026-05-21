type DetailRouteItem = {
  id: string
  title: string
  description?: string | null
  order?: number | null
  isRequired?: boolean
  status?: 'locked' | 'available' | 'completed' | 'current'
}

type DetailRouteMapProps = {
  items: DetailRouteItem[]
  emptyMessage?: string
}

const statusLabels: Record<NonNullable<DetailRouteItem['status']>, string> = {
  locked: 'Zaklenjeno',
  available: 'Na voljo',
  completed: 'Opravljeno',
  current: 'Trenutno',
}

function DetailRouteMap({
  items,
  emptyMessage = 'Ni elementov za prikaz poti.',
}: DetailRouteMapProps) {
  if (items.length === 0) {
    return <p className="text-sm text-brown-500">{emptyMessage}</p>
  }

  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const order = item.order ?? index + 1

        return (
          <li
            key={item.id}
            className="flex gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forest-600 text-sm font-bold text-white">
              {order}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-brown-900">{item.title}</h3>

                {item.isRequired !== undefined && (
                  <span className="rounded-full bg-sand-100 px-2 py-1 text-xs font-medium text-brown-600">
                    {item.isRequired ? 'Obvezno' : 'Izbirno'}
                  </span>
                )}

                {item.status && (
                  <span className="rounded-full bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700">
                    {statusLabels[item.status]}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-2 text-sm leading-6 text-brown-600">
                  {item.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default DetailRouteMap