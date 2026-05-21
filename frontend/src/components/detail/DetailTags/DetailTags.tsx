type DetailTagsProps = {
  tags: string[]
  emptyMessage?: string
}

function DetailTags({
  tags,
  emptyMessage = 'Ni dodanih ključnih besed.',
}: DetailTagsProps) {
  if (tags.length === 0) {
    return <p className="text-sm text-brown-500">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-forest-50 px-3 py-1 text-sm font-medium text-forest-700"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default DetailTags