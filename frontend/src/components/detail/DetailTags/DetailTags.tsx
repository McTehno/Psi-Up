import { appStyles } from '../../../design'

type DetailTagsProps = {
  tags: string[]
  emptyMessage?: string
}

function DetailTags({
  tags,
  emptyMessage = 'Ni dodanih ključnih besed.',
}: DetailTagsProps) {
  if (tags.length === 0) {
    return <p className={`text-sm ${appStyles.text.muted}`}>{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className={appStyles.tag.base}>
          {tag}
        </span>
      ))}
    </div>
  )
}

export default DetailTags