import AssistantInput from '../AssistantInput'
import AssistantMessage from '../AssistantMessage'
import { useAssistantChat } from '../../hooks/useAssistantChat'
import type { AssistantContextType } from '../../types'

type AssistantChatProps = {
  contextType?: AssistantContextType
  contextId?: string
  title?: string
}

const contextLabels: Record<AssistantContextType, string> = {
  learning_path: 'učna pot',
  module: 'modul',
  learning_unit: 'učna enota',
  general: 'vsebina',
}

function AssistantChat({
  contextType = 'general',
  contextId,
  title = 'Pomočnik za učenje',
}: AssistantChatProps) {
  const { messages, inputValue, setInputValue, sendMessage } =
    useAssistantChat()

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="border-b border-sand-200 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-forest-600">
          Assistant
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-brown-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-brown-500">
          Kontekst: {contextLabels[contextType]}
          {contextId ? ` (${contextId})` : ''}
        </p>
      </div>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <AssistantMessage key={message.id} message={message} />
        ))}
      </div>

      <AssistantInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={sendMessage}
      />
    </section>
  )
}

export default AssistantChat