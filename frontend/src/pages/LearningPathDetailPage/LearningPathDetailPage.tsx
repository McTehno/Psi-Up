import { useParams } from 'react-router-dom'

function LearningPathDetailPage() {
  const { learningPathId } = useParams<{ learningPathId: string }>()

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-brown-900">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-600">
          Učna pot
        </p>
        <h1 className="font-display text-4xl font-bold">
          Podrobnosti učne poti
        </h1>
        <p className="mt-4 text-brown-600">
          ID učne poti: {learningPathId}
        </p>
      </div>
    </main>
  )
}

export default LearningPathDetailPage