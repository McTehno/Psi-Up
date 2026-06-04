import { AlertCircle } from 'lucide-react'

type ErrorStateProps = {
  title?: string
  message: string
}

function ErrorState({
  title = 'Prišlo je do napake',
  message,
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0" />
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorState

