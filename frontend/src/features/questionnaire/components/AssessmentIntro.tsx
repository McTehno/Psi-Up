type AssessmentIntroProps = {
	title: string
	description: string
}

function AssessmentIntro({ title, description }: AssessmentIntroProps) {
	return (
		<div className="assessment-intro">
			<h1>{title}</h1>
			<p>{description}</p>
		</div>
	)
}

export default AssessmentIntro