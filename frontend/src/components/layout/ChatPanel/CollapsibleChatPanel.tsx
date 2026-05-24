import { Bot, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

type CollapsibleChatPanelProps = {
  title?: string
  description?: string
  footerText?: string
  className?: string
  onExpandedChange?: (isExpanded: boolean) => void
}

export function CollapsibleChatPanel({
  title = 'Chat pride kasneje',
  description = 'Ta prostor je rezerviran za pogovor z asistentom.',
  footerText = 'Kasneje lahko tukaj dodamo vprašanja, priporočila in pomoč glede trenutne strani.',
  className = '',
  onExpandedChange,
}: CollapsibleChatPanelProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLockedOpen, setIsLockedOpen] = useState(false)

  const isExpanded = isHovered || isLockedOpen

  useEffect(() => {
    onExpandedChange?.(isExpanded)
  }, [isExpanded, onExpandedChange])

  function handleClose() {
    setIsLockedOpen(false)
    setIsHovered(false)
  }

  return (
    <aside
      className={`absolute bottom-0 right-0 top-0 z-40 transition-[width] duration-300 ease-out ${
        isExpanded ? 'w-[360px]' : 'w-16'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isLockedOpen) {
          setIsHovered(false)
        }
      }}
    >
      <div
        className={`h-full overflow-hidden rounded-[2rem] border border-[#e7dac7] bg-white shadow-sm transition-all duration-300 ${
          isExpanded ? 'p-6' : 'p-3'
        }`}
      >
        {!isExpanded && (
          <button
            type="button"
            className="flex h-full w-full flex-col items-center justify-between rounded-[1.5rem] bg-[#F7F1E6] px-2 py-4 text-[#31583b] transition hover:bg-[#efe7d8]"
            aria-label="Odpri chat pomočnika"
          >
            <Bot className="h-5 w-5" />

            <span className="rotate-180 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl]">
              LLM pomočnik
            </span>

            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {isExpanded && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eee4] text-[#31583b]">
                <Bot className="h-6 w-6" />
              </div>

              {isLockedOpen && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F1E6] text-[#31583b] transition hover:bg-[#efe7d8]"
                  aria-label="Zapri chat pomočnika"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#31583b]">
              LLM pomočnik
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#2b2118]">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#756f65]">
              {description}
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsLockedOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setIsLockedOpen(true)
                }
              }}
              className="mt-6 flex min-h-[220px] cursor-text flex-col rounded-3xl border border-[#e7dac7] bg-[#F7F1E6] p-4 transition hover:border-[#cfc1aa]"
              aria-label="Zakleni chat pomočnika"
            >
              <div className="flex-1 text-sm leading-6 text-[#756f65]">
                Klikni v to območje, da chat ostane odprt tudi, ko umakneš
                miško.
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm text-[#9a9287] shadow-sm">
                <span className="flex-1">Vprašaj pomočnika ...</span>
                <Send className="h-4 w-4 text-[#31583b]" />
              </div>
            </div>

            <div className="mt-auto rounded-2xl bg-[#F7F1E6] p-4 text-sm leading-6 text-[#5F6652]">
              {footerText}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}