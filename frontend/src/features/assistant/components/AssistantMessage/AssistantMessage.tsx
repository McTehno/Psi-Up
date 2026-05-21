import type { AssistantMessage as AssistantMessageType } from '../../types'

type AssistantMessageProps = {
  message: AssistantMessageType
}

function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === 'user'

  return (
    <article
      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
        isUser
          ? 'ml-8 bg-forest-600 text-white'
          : 'mr-8 bg-sand-100 text-brown-800'
      }`}
    >
      {message.content}
    </article>
  )
}

export default AssistantMessage