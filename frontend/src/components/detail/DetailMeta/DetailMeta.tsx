type DetailMetaItem = {
  label: string
  value: string | number
}

type DetailMetaProps = {
  items: DetailMetaItem[]
}

function DetailMeta({ items }: DetailMetaProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-2xl bg-sand-100 px-4 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brown-400">
            {item.label}
          </p>
          <p className="mt-1 font-semibold text-brown-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export default DetailMeta