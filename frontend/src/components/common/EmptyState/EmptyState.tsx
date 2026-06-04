import { Search } from 'lucide-react'

type EmptyStateProps = {
  title?: string
  message?: string
}

function EmptyState({
  title = 'Ni podatkov',
  message = 'Trenutno ni vsebine za prikaz.',
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-sand-300 bg-white p-8 text-center">
      <Search className="mb-4 h-8 w-8 text-sand-400" />
      <h2 className="font-display text-xl font-semibold text-brown-900">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm text-brown-500">{message}</p>
    </div>
  )
}

export default EmptyState

