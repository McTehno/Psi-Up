import type { ReactNode } from 'react'

type SimpleMarkdownTextProps = {
  content: string
  className?: string
}

type InlineToken = {
  type: 'text' | 'strong' | 'em' | 'strongEm' | 'code'
  value: string
}

function normalizeMarkdownText(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\([*_`#\-[\]()])/g, '$1')
    .trim()
}

function parseInlineMarkdown(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  const pattern = /(`[^`\n]+`|\*\*\*[^*\n]+?\*\*\*|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      })
    }

    const value = match[0]

    if (value.startsWith('`') && value.endsWith('`')) {
      tokens.push({ type: 'code', value: value.slice(1, -1) })
    } else if (value.startsWith('***') && value.endsWith('***')) {
      tokens.push({ type: 'strongEm', value: value.slice(3, -3) })
    } else if (value.startsWith('**') && value.endsWith('**')) {
      tokens.push({ type: 'strong', value: value.slice(2, -2) })
    } else if (value.startsWith('*') && value.endsWith('*')) {
      tokens.push({ type: 'em', value: value.slice(1, -1) })
    }

    lastIndex = match.index + value.length
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      value: text.slice(lastIndex),
    })
  }

  return tokens
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return parseInlineMarkdown(text).map((token, index) => {
    const key = `${token.type}-${index}`

    if (token.type === 'strong') {
      return (
        <strong key={key} className="font-bold text-[#2b2118]">
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

    if (token.type === 'strongEm') {
      return (
        <strong key={key} className="font-bold text-[#2b2118]">
          <em className="italic">{token.value}</em>
        </strong>
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

    return <span key={key}>{token.value}</span>
  })
}

function isHeadingLine(line: string) {
  return /^\s{0,3}#{1,6}\s+/.test(line)
}

function isListLine(line: string) {
  return /^\s*[-+]\s+/.test(line) || /^\s*\*\s+/.test(line)
}

function getHeadingLevel(line: string) {
  const match = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/)
  return {
    level: match?.[1].length ?? 0,
    text: match?.[2].trim() ?? line.trim(),
  }
}

function getListItemText(line: string) {
  return line.replace(/^\s*[-+*]\s+/, '').trim()
}

function SimpleMarkdownText({
  content,
  className = '',
}: SimpleMarkdownTextProps) {
  const normalizedContent = normalizeMarkdownText(content)
  if (!normalizedContent) {
    return null
  }

  const lines = normalizedContent.split('\n')
  const elements: ReactNode[] = []
  let index = 0
  let keyIndex = 0

  while (index < lines.length) {
    const currentLine = lines[index].trim()

    if (!currentLine) {
      index += 1
      continue
    }

    if (isHeadingLine(currentLine)) {
      const { level, text } = getHeadingLevel(currentLine)
      const key = `heading-${keyIndex++}`

      if (level === 1) {
        elements.push(
          <h1 key={key} className="mb-3 text-xl font-bold leading-snug text-[#2b2118]">
            {renderInlineMarkdown(text)}
          </h1>,
        )
      } else if (level === 2) {
        elements.push(
          <h2 key={key} className="mb-3 text-lg font-bold leading-snug text-[#2b2118]">
            {renderInlineMarkdown(text)}
          </h2>,
        )
      } else {
        elements.push(
          <h3 key={key} className="mb-2 text-base font-bold leading-snug text-[#2b2118]">
            {renderInlineMarkdown(text)}
          </h3>,
        )
      }

      index += 1
      continue
    }

    if (isListLine(currentLine)) {
      const listItems: string[] = []

      while (index < lines.length && isListLine(lines[index])) {
        listItems.push(getListItemText(lines[index]))
        index += 1
      }

      elements.push(
        <ul key={`list-${keyIndex++}`} className="mb-3 list-disc space-y-1 pl-5">
          {listItems.map((item, itemIndex) => (
            <li key={`list-item-${itemIndex}`}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      )

      continue
    }

    const paragraphLines: string[] = []

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isHeadingLine(lines[index]) &&
      !isListLine(lines[index])
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    elements.push(
      <p key={`paragraph-${keyIndex++}`} className="mb-3 last:mb-0">
        {renderInlineMarkdown(paragraphLines.join(' '))}
      </p>,
    )
  }

  return (
    <div
      data-md-renderer="simple-markdown-v3"
      className={className}
    >
      {elements}
    </div>
  )
}

export default SimpleMarkdownText