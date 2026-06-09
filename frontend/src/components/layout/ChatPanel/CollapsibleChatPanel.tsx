import {
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Send,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type CollapsibleChatPanelVariant = 'desktop' | 'mobile'

type CollapsibleChatPanelProps = {
  title?: string
  description?: string
  variant?: CollapsibleChatPanelVariant
  className?: string
  children?: React.ReactNode
  onExpandedChange?: (isExpanded: boolean) => void
}

export function CollapsibleChatPanel({
  children,
  variant = 'desktop',
  className = '',
  title = 'AI pomočnik',
  onExpandedChange,
}: CollapsibleChatPanelProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLockedOpen, setIsLockedOpen] = useState(false)

  const isMobile = variant === 'mobile'
  const isExpanded = isMobile ? isLockedOpen : isHovered || isLockedOpen

  useEffect(() => {
    onExpandedChange?.(isExpanded)
  }, [isExpanded, onExpandedChange])

  function handlePanelClick() {
    if (isMobile || isExpanded) {
      setIsLockedOpen(true)
    }
  }

  function handleClose() {
    setIsLockedOpen(false)
    setIsHovered(false)
  }

  if (isMobile) {
    return (
      <aside className={`relative z-10 w-full ${className}`}>
        <div
          onClick={handlePanelClick}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/45 bg-white/28 p-3 shadow-[0_20px_54px_rgba(43,33,24,0.14)] backdrop-blur-[34px] backdrop-saturate-150 transition-all duration-500 before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.78),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(248,231,190,0.46),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.52),rgba(255,253,248,0.18))] before:content-[''] after:pointer-events-none after:absolute after:inset-[1px] after:rounded-[1.7rem] after:border after:border-white/35 after:content-[''] sm:rounded-[2rem] sm:p-4 sm:shadow-[0_24px_70px_rgba(43,33,24,0.16)] sm:before:rounded-[2rem] sm:after:rounded-[1.95rem]"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white/35 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_22px_rgba(49,88,59,0.10)] backdrop-blur-2xl sm:h-12 sm:w-12 sm:rounded-[1.35rem]">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#31583b] sm:gap-2 sm:text-xs sm:tracking-[0.2em]">
                <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">{title}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setIsLockedOpen((currentValue) => !currentValue)
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/35 text-[#31583b] shadow-sm backdrop-blur-xl transition hover:bg-white/55 sm:h-11 sm:w-11"
              aria-label={isExpanded ? 'Zapri chat pomočnika' : 'Odpri chat pomočnika'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          <div
            className={`relative z-10 grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
              isExpanded
                ? 'mt-4 grid-rows-[1fr] opacity-100 sm:mt-6'
                : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-4 flex max-h-[calc(100vh-170px)] min-h-0 cursor-text flex-col overflow-hidden rounded-[1.5rem] border border-white/45 bg-white/22 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_14px_34px_rgba(43,33,24,0.08)] backdrop-blur-2xl transition hover:border-white/70 hover:bg-white/30 sm:mt-6 sm:rounded-[1.75rem] sm:p-4">
                {children ?? (
                  <>
                    <div className="flex-1 text-sm leading-7 text-[#6d665d] sm:text-base sm:leading-8">
                      Klikni kamorkoli v panel, da chat ostane odprt.
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-full border border-white/55 bg-white/45 px-4 py-3 text-sm text-[#8c8378] shadow-[0_16px_36px_rgba(43,33,24,0.10)] backdrop-blur-2xl sm:mt-5 sm:gap-3 sm:px-5 sm:py-4 sm:text-base">
                      <span className="min-w-0 flex-1 truncate">
                        Vprašaj pomočnika ...
                      </span>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#31583b] text-white shadow-[0_10px_24px_rgba(49,88,59,0.24)]">
                        <Send className="h-4 w-4" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    )
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
            onClick={(event) => {
              event.stopPropagation()
              setIsLockedOpen(true)
            }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-between rounded-[1.75rem] border border-white/45 bg-white/30 px-2 py-4 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_18px_38px_rgba(49,88,59,0.12)] backdrop-blur-2xl transition hover:bg-white/45"
            aria-label="Odpri chat pomočnika"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/45 shadow-sm backdrop-blur-xl">
              <Bot className="h-5 w-5" />
            </div>

            <span className="rotate-180 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
              {title}
            </span>

            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {isExpanded && (
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border border-white/50 bg-white/35 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_34px_rgba(49,88,59,0.14)] backdrop-blur-2xl">
                  <Bot className="h-5 w-5" />
                </div>

                <p className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#31583b]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{title}</span>
                </p>
              </div>

              {isLockedOpen && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleClose()
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/30 text-[#31583b] shadow-sm backdrop-blur-xl transition hover:bg-white/50"
                  aria-label="Zapri chat pomočnika"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-5 flex min-h-0 flex-1 cursor-text flex-col rounded-[2rem] border border-white/45 bg-white/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_18px_46px_rgba(43,33,24,0.08)] backdrop-blur-2xl transition hover:border-white/70 hover:bg-white/30">
              {children ?? (
                <>
                  <div className="flex-1 text-base leading-8 text-[#6d665d]">
                    Klikni kamorkoli v panel, da chat ostane odprt tudi, ko umakneš
                    miško.
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-full border border-white/55 bg-white/45 px-5 py-4 text-base text-[#8c8378] shadow-[0_16px_36px_rgba(43,33,24,0.10)] backdrop-blur-2xl">
                    <span className="flex-1">Vprašaj pomočnika ...</span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#31583b] text-white shadow-[0_10px_24px_rgba(49,88,59,0.24)]">
                      <Send className="h-4 w-4" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}