import './CompetencyCard.css'
import icon from '../../../../public/lamp.png'

type CompetencyCardProps = {
	title: string
	description: string
	isSelected?: boolean
	onClick?: () => void
}

function CompetencyCard({
	title,
	description,
	isSelected = false,
	onClick,
}: CompetencyCardProps) {
	return (
		<button
			className={`competency-card ${
				isSelected ? 'competency-card--selected' : ''
			}`}
			type="button"
			onClick={onClick}
		>
			{isSelected && (
				<div className="competency-card__check">
					✓
				</div>
			)}

			<div className="competency-card__icon">
				<img src={icon} alt="" />
			</div>

			<div className="competency-card__content">
				<h2>{title}</h2>
				<p>{description}</p>
			</div>
		</button>
	)
}

export default CompetencyCard