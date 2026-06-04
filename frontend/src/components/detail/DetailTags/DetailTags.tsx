import { Link } from 'react-router-dom'

import { appStyles } from '../../../design'

type DetailTagsProps = {
	tags: string[]
	emptyMessage?: string
}

function DetailTags({
	tags,
	emptyMessage = 'Ni dodanih kljuÄŤnih besed.',
}: DetailTagsProps) {
	if (tags.length === 0) {
		return <p className={`text-sm ${appStyles.text.muted}`}>{emptyMessage}</p>
	}

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Link
					key={tag}
					to={`/search?q=${encodeURIComponent(tag)}`}
					className="inline-flex items-center rounded-[10px] border border-[#d8e8da] bg-[#f2f8f1] px-3.5 py-1.5 text-sm font-semibold text-[#31583b] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#31583b]/40 hover:bg-[#eaf4e9] hover:text-[#274a31] hover:shadow-md"
				>
					#{tag}
				</Link>
			))}
		</div>
	)
}

export default DetailTags

