import CompetencyCard from './CompetencyCard'

type CompetencyGroup = {
	_id: string
	title: string
	description?: string
}

type AssessmentOptionsProps = {
	groups: CompetencyGroup[]
	selectedGroupId: string | null
	onSelectGroup: (groupId: string) => void
}

function AssessmentOptions({
	groups,
	selectedGroupId,
	onSelectGroup,
}: AssessmentOptionsProps) {
	return (
		<div className="questions-container">
			{groups.map((group) => (
				<CompetencyCard
					key={group._id}
					title={group.title}
					description={group.description ?? ''}
					isSelected={selectedGroupId === group._id}
					onClick={() => onSelectGroup(group._id)}
				/>
			))}
		</div>
	)
}

export default AssessmentOptions