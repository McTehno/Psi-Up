import { Bot, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react'
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

  function handlePanelClick() {
  if (isExpanded) {
    setIsLockedOpen(true)
  }
}

  return (
    <aside
      className={`absolute bottom-0 right-0 top-0 z-40 transition-[width] duration-500 ease-out ${
        isExpanded ? 'w-[420px]' : 'w-16'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isLockedOpen) {
          setIsHovered(false)
        }
      }}
    >
      <div
        onClick={handlePanelClick}
        className={`relative h-full overflow-hidden rounded-[2.25rem] border border-white/45 bg-white/28 shadow-[0_28px_90px_rgba(43,33,24,0.22)] backdrop-blur-[34px] backdrop-saturate-150 transition-all duration-500 before:pointer-events-none before:absolute before:inset-0 before:rounded-[2.25rem] before:bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.78),transparent_34%),radial-gradient(circle_at_85%_16%,rgba(248,231,190,0.42),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.50),rgba(255,253,248,0.18))] before:content-[''] after:pointer-events-none after:absolute after:inset-[1px] after:rounded-[2.2rem] after:border after:border-white/35 after:content-[''] ${
          isExpanded ? 'p-7' : 'p-2.5'
        }`}
      >
        {!isExpanded && (
          <button
            type="button"
            className="relative z-10 flex h-full w-full flex-col items-center justify-between rounded-[1.75rem] border border-white/45 bg-white/30 px-2 py-4 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_18px_38px_rgba(49,88,59,0.12)] backdrop-blur-2xl transition hover:bg-white/45"
            aria-label="Odpri chat pomočnika"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/45 shadow-sm backdrop-blur-xl">
              <Bot className="h-5 w-5" />
            </div>

            <span className="rotate-180 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
              LLM pomočnik
            </span>

            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {isExpanded && (
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/50 bg-white/35 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_34px_rgba(49,88,59,0.14)] backdrop-blur-2xl">
                <Bot className="h-6 w-6" />
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden rounded-full border border-white/45 bg-white/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#31583b] shadow-sm backdrop-blur-xl min-[1700px]:block">
                  Beta
                </div>

                {isLockedOpen && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClose()
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/30 text-[#31583b] shadow-sm backdrop-blur-xl transition hover:bg-white/50"
                    aria-label="Zapri chat pomočnika"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-7">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#31583b]">
                <Sparkles className="h-4 w-4" />
                LLM pomočnik
              </p>

              <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.04em] text-[#2b2118]">
                {title}
              </h2>

              <p className="mt-4 text-base leading-8 text-[#6d665d]">
                {description}
              </p>
            </div>

            <div
              className="mt-8 flex min-h-[250px] cursor-text flex-col rounded-[2rem] border border-white/45 bg-white/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_18px_46px_rgba(43,33,24,0.08)] backdrop-blur-2xl transition hover:border-white/70 hover:bg-white/30"
            >
              <div className="flex-1 text-base leading-8 text-[#6d665d]">
                Predel
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-full border border-white/55 bg-white/45 px-5 py-4 text-base text-[#8c8378] shadow-[0_16px_36px_rgba(43,33,24,0.10)] backdrop-blur-2xl">
                <span className="flex-1">Vprašaj pomočnika ...</span>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#31583b] text-white shadow-[0_10px_24px_rgba(49,88,59,0.24)]">
                  <Send className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="mt-auto rounded-[1.75rem] border border-white/45 bg-white/24 p-5 text-base leading-8 text-[#5f6652] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl">
              {footerText}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}