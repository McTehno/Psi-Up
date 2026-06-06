import SimpleMarkdownText from '../../../components/common/SimpleMarkdownText/SimpleMarkdownText'

type Competency = {
  competency_id: string
  title?: string
}

type AnswerOption = {
  answer: string
  weight: boolean
}

type QuestionnaireItem = {
  question: string
  answers: AnswerOption[]
}

type CompetencyGroup = {
  _id: string
  title: string
  description?: string
  competencies?: Competency[]
}

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

type AssistantExchange = {
  userMessage: string
  answer: string
  isPending?: boolean
}

type AssessmentLayoutProps = {
  imageSrc: string
  defaultNote: string
  phase: AssessmentPhase
  selectedGroup?: CompetencyGroup
  currentQuestion?: QuestionnaireItem
  selectedAnswer?: AnswerOption
  assistantExchange?: AssistantExchange | null
  children: React.ReactNode
}

function AssessmentLayout({
  imageSrc,
  defaultNote,
  phase,
  selectedGroup,
  currentQuestion,
  selectedAnswer,
  assistantExchange,
  children,
}: AssessmentLayoutProps) {
  const selectedCompetencies = selectedGroup?.competencies ?? []

  return (
    <main className="assessment-page">
      <div className="assessment-panel">
        <aside className="assessment-visual">
          <img className="woman-image" src={imageSrc} alt="Asistentka" />

          <div className="assistant-note">
            <div className="assistant-note__icon" aria-hidden="true">
              ☘
            </div>

            <div className="assistant-note__content">
              {phase === 'group-selection' && !selectedGroup && (
                <p>{defaultNote}</p>
              )}

              {phase === 'group-selection' && selectedGroup && (
                <>
                  <p>
                    Izbrali ste: <strong>{selectedGroup.title}</strong>
                  </p>

                  {selectedCompetencies.length > 0 && (
                    <div className="assistant-competencies">
                      <h3>S to izbiro boste razvijali kompetence:</h3>
                      <ul>
                        {selectedCompetencies.map((competency) => (
                          <li key={competency.competency_id}>
                            {competency.title ?? competency.competency_id}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {phase === 'questionnaire' && assistantExchange && (
  <div
    className="assistant-note__assistant-answer"
    aria-live="polite"
  >
    <SimpleMarkdownText
      content={assistantExchange.answer}
      className={
        assistantExchange.isPending
          ? 'assistant-note__answer assistant-note__answer--pending'
          : 'assistant-note__answer'
      }
    />
  </div>
)}

              {phase === 'questionnaire' && !assistantExchange && (
                <>
                  <p>
                    Odgovarjate za področje:{' '}
                    <strong>{selectedGroup?.title}</strong>
                  </p>

                  {currentQuestion && (
                    <div className="assistant-competencies">
                      <h3>Trenutno vprašanje:</h3>
                      <p>{currentQuestion.question}</p>

                      {selectedAnswer && (
                        <p>
                          Izbran odgovor:{' '}
                          <strong>{selectedAnswer.answer}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {phase === 'completed' && (
                <p>
                  Vprašalnik je zaključen. Zbrane odgovore lahko uporabimo za
                  izračun priporočene učne poti.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="assessment-content">{children}</section>
      </div>
    </main>
  )
}

export default AssessmentLayout


