type AnswerOption = {
	answer: string
	weight: number
}

type QuestionnaireItem = {
	question: string
	answers: AnswerOption[]
}

type QuestionnaireQuestionProps = {
	question: QuestionnaireItem
	selectedAnswer?: AnswerOption
	onSelectAnswer: (answer: AnswerOption) => void
}

function QuestionnaireQuestion({
	question,
	selectedAnswer,
	onSelectAnswer,
}: QuestionnaireQuestionProps) {
	return (
		<div className="questionnaire-options">
			{question.answers.map((answer) => (
				<button
					key={answer.answer}
					type="button"
					className={`answer-card ${
						selectedAnswer?.answer === answer.answer
							? 'answer-card--selected'
							: ''
					}`}
					onClick={() => onSelectAnswer(answer)}
				>
					<span>{answer.answer}</span>

					{selectedAnswer?.answer === answer.answer && (
						<span className="answer-card__check">✓</span>
					)}
				</button>
			))}
		</div>
	)
}

export default QuestionnaireQuestion