import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'

type QuestionnaireToastProps = {
  targetType: 'module' | 'learning_unit' | 'learning_path'
  targetId: string
  delayMs?: number
  durationMs?: number
}

export default function QuestionnaireToast({
  targetType,
  targetId,
  delayMs = 10000,
  durationMs = 15000,
}: QuestionnaireToastProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'hidden' | 'mounting' | 'visible' | 'exit'>('hidden')
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Preveri ali je uporabnik ze zavrnil, da se izognemo ponavljojocim prikazom
    const dismissed = sessionStorage.getItem(`dismissed_toast_${targetType}_${targetId}`)
    if (dismissed) return

    showTimer.current = setTimeout(() => {
      setPhase('mounting')
    }, delayMs)

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current)
    }
  }, [targetType, targetId, delayMs])

  const dismiss = () => {
    sessionStorage.setItem(`dismissed_toast_${targetType}_${targetId}`, 'true')
    setPhase('exit')
  }

  const handleStart = () => {
    sessionStorage.setItem(`dismissed_toast_${targetType}_${targetId}`, 'true')
    setPhase('exit')
    navigate(`/assessment?target_type=${targetType}&target_id=${targetId}`)
  }

  useEffect(() => {
    if (phase === 'mounting') {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setPhase('visible')
        })
        exitTimer.current = setTimeout(() => cancelAnimationFrame(raf2), 100)
      })
      return () => cancelAnimationFrame(raf1)
    }

    if (phase === 'visible') {
      autoTimer.current = setTimeout(dismiss, durationMs)
      return () => {
        if (autoTimer.current) clearTimeout(autoTimer.current)
      }
    }

    if (phase === 'exit') {
      exitTimer.current = setTimeout(() => {
        setPhase('hidden')
      }, 450)
      return () => {
        if (exitTimer.current) clearTimeout(exitTimer.current)
      }
    }
  }, [phase, durationMs])

  if (phase === 'hidden') return null

  const isAnimatedIn = phase === 'visible'

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] pointer-events-none"
    >
      <div
        role="alert"
        aria-live="assertive"
        className="pointer-events-auto relative flex flex-col sm:flex-row items-start sm:items-center gap-4 w-max max-w-[min(480px,90vw)] p-4 rounded-[20px] border border-[#d7a56b]/40 backdrop-blur-xl bg-[#fffdf8]/90 shadow-[0_16px_40px_rgba(208,122,18,0.12),_0_4px_12px_rgba(57,47,35,0.06)]"
        style={{
          opacity: isAnimatedIn ? 1 : 0,
          transform: isAnimatedIn
            ? 'translateY(0) scale(1)'
            : phase === 'exit'
              ? 'translateY(16px) scale(0.96)'
              : 'translateY(24px) scale(0.96)',
          transition: phase === 'exit'
            ? 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
            : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[#f4eee4] text-[#d07a12]">
          <ClipboardCheck className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 pr-6 sm:pr-2">
          <h4 className="text-[15px] font-bold text-[#111111] leading-tight mb-1">
            Želite preveriti svoje znanje?
          </h4>
          <p className="text-[13px] text-[#706b60] leading-snug">
            Za to vsebino je na voljo kratek vprašalnik.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0 self-end sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={dismiss}
            className="text-[13px] font-bold text-[#706b60] hover:text-[#111111] transition-colors px-2 py-2"
          >
            Kasneje
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#c98a43] px-4 py-2 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(201,138,67,0.25)] transition hover:bg-[#b97835]"
          >
            Odpri
          </button>
        </div>
      </div>
    </div>
  )
}
