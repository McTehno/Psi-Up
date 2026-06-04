import { Loader2 } from 'lucide-react'

type LoadingStateProps = {
  message?: string
}

function LoadingState({ message = 'Nalaganje...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 text-center text-brown-600 shadow-sm">
      <Loader2 className="h-6 w-6 animate-spin text-forest-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export default LoadingState

