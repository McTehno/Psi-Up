import type { RouteNode } from '../../../types/route-node'

/**
 * Status elementa v prikazu poti.
 *
 * Uporaba:
 * - locked: uporabnik še ne more dostopati do elementa
 * - available: element je na voljo
 * - completed: element je opravljen
 * - current: element je trenutno izbran ali aktiven
 */
export type DetailRouteItemStatus =
  | 'locked'
  | 'available'
  | 'completed'
  | 'current'

/**
 * Oblika podatka, ki jo DetailRouteMap neposredno prikaže.
 *
 * To je UI-friendly oblika:
 * - title je že pripravljen za prikaz
 * - durationLabel je že oblikovan tekst
 * - typeLabel je tekst, ki ga uporabnik vidi
 *
 * Ta tip lahko še naprej uporabljajo obstoječe detail strani,
 * zato s to spremembo ne zlomimo stare kode.
 */
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

/**
 * DetailRouteMap lahko sprejme:
 * - DetailRouteItem[]: stara UI oblika, ki jo komponenta že podpira
 * - RouteNode[]: nova normalizirana oblika iz detail-normalizers.ts
 *
 * S tem lahko postopoma prehajamo na bolj fleksibilen frontend model,
 * brez da bi morali naenkrat refactorati vse detail strani.
 */
type DetailRouteMapItem = DetailRouteItem | RouteNode

type DetailRouteMapProps = {
  items: DetailRouteMapItem[]
  emptyMessage?: string
}

/**
 * Slovenske oznake za statuse.
 */
const statusLabels: Record<DetailRouteItemStatus, string> = {
  locked: 'Zaklenjeno',
  available: 'Na voljo',
  completed: 'Opravljeno',
  current: 'Trenutno',
}

/**
 * CSS className vrednosti za prikaz statusov.
 *
 * Barve ostajajo enake kot prej, da ne spreminjamo izgleda strani.
 */
const statusClasses: Record<DetailRouteItemStatus, string> = {
  locked: 'bg-[rgba(123,118,108,0.12)] text-[#6d6a61]',
  available: 'bg-[rgba(219,210,195,0.5)] text-[#5f665d]',
  completed: 'bg-[rgba(47,74,49,0.12)] text-[#2f4a31]',
  current: 'bg-[#31583b] text-white',
}

/**
 * Oznake za tipe vsebin.
 *
 * RouteNode uporablja tehnične tipe:
 * - learning_path
 * - module
 * - learning_unit
 *
 * Uporabniku pa prikažemo lepše slovenske oznake.
 */
const routeNodeTypeLabels: Record<RouteNode['type'], string> = {
  learning_path: 'Učna pot',
  module: 'Modul',
  learning_unit: 'Učna enota',
}

/**
 * Preveri, ali je item RouteNode.
 *
 * RouteNode ima vedno polje "type".
 * DetailRouteItem tega polja nima.
 */
const isRouteNode = (item: DetailRouteMapItem): item is RouteNode => {
  return 'type' in item
}

/**
 * Formatira trajanje za prikaz.
 *
 * Trenutna baza uporablja duration_hours.
 * Za prihodnost podpiramo tudi duration_min.
 */
const formatDurationLabel = (item: RouteNode): string | null => {
  if (typeof item.durationHours === 'number') {
    return `${String(item.durationHours).replace('.', ',')} h`
  }

  if (typeof item.durationMin === 'number') {
    return `${item.durationMin} min`
  }

  return null
}

/**
 * Pretvori RouteNode v DetailRouteItem.
 *
 * Zakaj to potrebujemo:
 * DetailRouteMap interno že zna lepo prikazati DetailRouteItem.
 * Namesto da prepišemo celotno komponento, RouteNode samo pretvorimo
 * v obliko, ki jo komponenta že razume.
 */
const mapRouteNodeToDetailRouteItem = (item: RouteNode): DetailRouteItem => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    typeLabel: routeNodeTypeLabels[item.type],
    durationLabel: formatDurationLabel(item),
    order: item.order,
    parallelGroup: item.parallelGroup,
    isRequired: item.isRequired,
    prerequisites: item.prerequisites,
  }
}

/**
 * Pretvori vsak vhodni item v DetailRouteItem.
 *
 * Če komponenta dobi star DetailRouteItem, ga pusti takšnega, kot je.
 * Če dobi nov RouteNode, ga pretvori.
 */
const normalizeDetailRouteItem = (
  item: DetailRouteMapItem,
): DetailRouteItem => {
  if (isRouteNode(item)) {
    return mapRouteNodeToDetailRouteItem(item)
  }

  return item
}

/**
 * DetailRouteMap prikaže zaporedje povezanih vsebin na detail strani.
 *
 * Primeri uporabe:
 * - LearningPathDetailPage: prikaže module znotraj učne poti
 * - ModuleDetailPage: prikaže učne enote znotraj modula
 * - prihodnje razširitve: prikaže tudi učno enoto direktno znotraj učne poti
 *
 * Komponenta ne bere direktno backend strukture.
 * Dobi že pripravljene oziroma normalizirane podatke.
 */
function DetailRouteMap({
  items,
  emptyMessage = 'Ni elementov za prikaz poti.',
}: DetailRouteMapProps) {
  if (items.length === 0) {
    return <p className="text-sm text-[#706b60]">{emptyMessage}</p>
  }

  const normalizedItems = items.map(normalizeDetailRouteItem)

  const sortedItems = [...normalizedItems].sort((firstItem, secondItem) => {
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

