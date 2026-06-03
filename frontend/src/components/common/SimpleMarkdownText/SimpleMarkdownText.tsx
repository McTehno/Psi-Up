import type { ReactNode } from 'react'

type SimpleMarkdownTextProps = {
  content: string
  className?: string
}

type InlineToken = {
  type: 'strong' | 'em' | 'code' | 'text'
  value: string
}

function parseInlineMarkdown(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    const value = match[0]

    if (value.startsWith('**') && value.endsWith('**')) {
      tokens.push({ type: 'strong', value: value.slice(2, -2) })
    } else if (value.startsWith('*') && value.endsWith('*')) {
      tokens.push({ type: 'em', value: value.slice(1, -1) })
    } else if (value.startsWith('`') && value.endsWith('`')) {
      tokens.push({ type: 'code', value: value.slice(1, -1) })
    }

    lastIndex = match.index + value.length
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return tokens
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return parseInlineMarkdown(text).map((token, index) => {
    const key = `${token.type}-${index}`

    if (token.type === 'strong') {
      return (
        <strong key={key} className="font-bold text-[#33442f]">
          {token.value}
        </strong>
      )
    }

    if (token.type === 'em') {
      return (
        <em key={key} className="italic">
          {token.value}
        </em>
      )
    }

    if (token.type === 'code') {
      return (
        <code
          key={key}
          className="rounded-md bg-[#f3eadc] px-1.5 py-0.5 font-mono text-[0.92em] text-[#33442f]"
        >
          {token.value}
        </code>
      )
    }

    return token.value
  })
}

function getListItemText(line: string) {
  return line.replace(/^\s*[-*]\s+/, '').trim()
}

function SimpleMarkdownText({ content, className = '' }: SimpleMarkdownTextProps) {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return null
  }

  const blocks = normalizedContent.split(/\n{2,}/).map((block) => block.trim())

  return (
    <div className={['simple-markdown-text', className].filter(Boolean).join(' ')}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
        const isUnorderedList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))

        if (isUnorderedList) {
          return (
            <ul key={`block-${blockIndex}`}>
              {lines.map((line, lineIndex) => (
                <li key={`item-${blockIndex}-${lineIndex}`}>
                  {renderInlineMarkdown(getListItemText(line))}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`block-${blockIndex}`}>
            {renderInlineMarkdown(lines.join(' '))}
          </p>
        )
      })}
    </div>
  )
}

export default SimpleMarkdownText