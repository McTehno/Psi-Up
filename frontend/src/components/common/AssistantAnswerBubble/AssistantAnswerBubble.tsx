import SimpleMarkdownText from '../SimpleMarkdownText/SimpleMarkdownText'

type AssistantAnswerBubbleProps = {
  content: string
}

function AssistantAnswerBubble({ content }: AssistantAnswerBubbleProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] animate-[fadeIn_0.22s_ease-out] break-words rounded-[1.25rem] rounded-bl-md border border-[#ded5c6]/80 bg-[#fffdf8]/75 px-4 py-3 text-sm leading-6 text-[#5f6652] shadow-[0_12px_28px_rgba(57,47,35,0.08)] backdrop-blur-xl">
        <SimpleMarkdownText
          content={content}
          className="text-sm leading-6 text-[#5f6652] [&>:last-child]:mb-0"
        />
      </div>
    </div>
  )
}

export default AssistantAnswerBubble