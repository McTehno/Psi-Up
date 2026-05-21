import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'
import { AssistantChat } from '../../features/assistant'
import { getLearningUnitDetail } from '../../services/learning-unit-service'
import type { LearningUnitResponse } from '../../types/learning-unit'

function LearningUnitDetailPage() {
  const { learningUnitId } = useParams<{ learningUnitId: string }>()

  const [learningUnit, setLearningUnit] = useState<LearningUnitResponse | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadLearningUnit() {
      if (!learningUnitId) {
        setErrorMessage('Manjka ID učne enote.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const data = await getLearningUnitDetail(learningUnitId)
        setLearningUnit(data)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Prišlo je do napake pri nalaganju učne enote.'

        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadLearningUnit()
  }, [learningUnitId])

  if (isLoading) {
    return (
      <DetailPageShell>
        <LoadingState message="Nalaganje učne enote..." />
      </DetailPageShell>
    )
  }

  if (errorMessage) {
    return (
      <DetailPageShell>
        <ErrorState
          title="Učne enote ni bilo mogoče naložiti"
          message={errorMessage}
        />
      </DetailPageShell>
    )
  }

  if (!learningUnit) {
    return (
      <DetailPageShell>
        <EmptyState
          title="Učna enota ni najdena"
          message="Za izbrani ID ni podatkov o učni enoti."
        />
      </DetailPageShell>
    )
  }

  return (
    <DetailPageShell
      sidebar={
        <AssistantChat
          contextType="learning_unit"
          contextId={learningUnit.id}
          title="Pomočnik za učno enoto"
        />
      }
    >
      <DetailHero
        eyebrow="Učna enota"
        title={learningUnit.title}
        description={learningUnit.short_description}
      >
        <DetailMeta
          items={[
            ...(learningUnit.duration_min
              ? [{ label: 'Trajanje', value: `${learningUnit.duration_min} min` }]
              : []),
            {
              label: 'Spretnosti',
              value: learningUnit.skills.length,
            },
            {
              label: 'Vprašanja',
              value: learningUnit.self_assessment_questions.length,
            },
          ]}
        />
      </DetailHero>

      <DetailSection
        title="Ključne besede"
        description="Teme in pojmi, povezani s to učno enoto."
      >
        <DetailTags tags={learningUnit.keywords} />
      </DetailSection>

      <DetailSection
        title="Spretnosti"
        description="Spretnosti, ki jih pokriva ta učna enota."
      >
        {learningUnit.skills.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {learningUnit.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-2xl bg-sand-50 p-4 text-sm font-medium text-brown-800"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Ni dodanih spretnosti"
            message="Ta učna enota trenutno nima navedenih spretnosti."
          />
        )}
      </DetailSection>

      <DetailSection
        title="Vprašanja za samooceno"
        description="Vprašanja pomagajo oceniti, ali uporabnik že obvlada vsebino."
      >
        {learningUnit.self_assessment_questions.length > 0 ? (
          <div className="space-y-4">
            {learningUnit.self_assessment_questions.map((question) => (
              <article
                key={question.id}
                className="rounded-2xl border border-sand-200 bg-sand-50 p-4"
              >
                <p className="font-medium text-brown-900">
                  {question.question}
                </p>

                {question.related_skill && (
                  <p className="mt-2 text-sm text-brown-500">
                    Povezana spretnost: {question.related_skill}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Ni vprašanj za samooceno"
            message="Ta učna enota trenutno nima vprašanj za samooceno."
          />
        )}
      </DetailSection>
    </DetailPageShell>
  )
}

export default LearningUnitDetailPage