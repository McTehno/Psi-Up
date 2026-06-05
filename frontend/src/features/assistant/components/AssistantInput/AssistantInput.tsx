import { Send } from 'lucide-react'

type AssistantInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

function AssistantInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Vprašaj pomočnika...',
}: AssistantInputProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-sand-200 p-4">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-2xl bg-sand-50 px-4 py-3 text-sm text-brown-900 outline-none ring-1 ring-sand-200 placeholder:text-brown-400 focus:ring-2 focus:ring-forest-500"
      />

      <button
        type="submit"
        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-forest-600 text-white transition-colors hover:bg-forest-700"
        aria-label="Pošlji vprašanje"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}

export default AssistantInput

