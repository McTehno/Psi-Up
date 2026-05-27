import { useEffect, useState, useCallback, useRef } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastVariant = 'error' | 'success'

type ToastProps = {
  message: string | null
  variant?: ToastVariant
  duration?: number
  onDismiss: () => void
}

const VARIANTS: Record<
  ToastVariant,
  {
    bg: string
    border: string
    text: string
    icon: string
    progress: string
    iconEl: typeof AlertCircle
  }
> = {
  error: {
    bg: 'bg-[#fffaf8]',
    border: 'border-[#e8c4b8]',
    text: 'text-[#9b3014]',
    icon: 'text-[#c44425]',
    progress: 'bg-[#c44425]',
    iconEl: AlertCircle,
  },
  success: {
    bg: 'bg-[#f6faf5]',
    border: 'border-[#bdd4b8]',
    text: 'text-[#2f5430]',
    icon: 'text-[#3d7a40]',
    progress: 'bg-[#3d7a40]',
    iconEl: CheckCircle2,
  },
}

/**
 * Phase lifecycle:
 *   hidden → mounting (renders at off-screen position) → visible (animates in) → exit (animates out) → hidden
 */
export default function Toast({
  message,
  variant = 'error',
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const [phase, setPhase] = useState<'mounting' | 'visible' | 'exit' | 'hidden'>('hidden')
  const [currentMessage, setCurrentMessage] = useState<string | null>(null)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    setPhase('exit')
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current)
      if (autoTimer.current) clearTimeout(autoTimer.current)
    }
  }, [])

  // When message changes, trigger the lifecycle
  useEffect(() => {
    if (message) {
      // Clear any pending timers from a previous toast
      if (exitTimer.current) clearTimeout(exitTimer.current)
      if (autoTimer.current) clearTimeout(autoTimer.current)

      setCurrentMessage(message)
      // 1) Mount: renders the element at its starting (off-screen) position
      setPhase('mounting')
    } else if (phase !== 'hidden') {
      setPhase('exit')
    }
  }, [message])

  // Phase transitions
  useEffect(() => {
    if (phase === 'mounting') {
      // 2) After one frame paint in the "mounting" position, transition to "visible"
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setPhase('visible')
        })
        // Store for cleanup
        exitTimer.current = setTimeout(() => cancelAnimationFrame(raf2), 100)
      })
      return () => cancelAnimationFrame(raf1)
    }

    if (phase === 'visible') {
      // 3) Start auto-dismiss countdown
      autoTimer.current = setTimeout(dismiss, duration)
      return () => {
        if (autoTimer.current) clearTimeout(autoTimer.current)
      }
    }

    if (phase === 'exit') {
      // 4) After exit animation completes, hide and notify parent
      exitTimer.current = setTimeout(() => {
        setPhase('hidden')
        setCurrentMessage(null)
        onDismiss()
      }, 450)
      return () => {
        if (exitTimer.current) clearTimeout(exitTimer.current)
      }
    }
  }, [phase, duration, dismiss, onDismiss])

  // Don't render anything when hidden
  if (phase === 'hidden' || !currentMessage) return null

  const v = VARIANTS[variant]
  const Icon = v.iconEl
  const isAnimatedIn = phase === 'visible'

  return (
    <div
      className="fixed top-6 left-1/2 z-[100] pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div
        role="alert"
        aria-live="assertive"
        className={`
          pointer-events-auto relative
          flex items-start gap-3 
          w-max max-w-[min(420px,90vw)]
          px-4 py-3.5
          rounded-2xl border
          backdrop-blur-md
          ${v.bg} ${v.border}
        `}
        style={{
          opacity: isAnimatedIn ? 1 : 0,
          transform: isAnimatedIn
            ? 'translateY(0) scale(1)'
            : phase === 'exit'
              ? 'translateY(-12px) scale(0.96)'
              : 'translateY(18px) scale(0.96)',
          transition: phase === 'exit'
            ? 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
            : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: variant === 'error'
            ? '0 8px 32px rgba(196, 68, 37, 0.12), 0 2px 8px rgba(196, 68, 37, 0.06)'
            : '0 8px 32px rgba(61, 122, 64, 0.12), 0 2px 8px rgba(61, 122, 64, 0.06)',
        }}
      >
        <div className={`mt-0.5 shrink-0 ${v.icon}`}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </div>

        <p className={`text-[13px] leading-snug font-medium ${v.text} pr-2 select-none`}>
          {currentMessage}
        </p>

        <button
          type="button"
          onClick={dismiss}
          className={`
            shrink-0 -mr-1 -mt-0.5
            p-1 rounded-lg
            ${v.text} opacity-40
            hover:opacity-100 hover:bg-black/[0.04]
            transition-all duration-200
            cursor-pointer
          `}
          aria-label="Zapri obvestilo"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-black/[0.04]">
          <div
            className={`h-full ${v.progress} rounded-full origin-left`}
            style={{
              animation: isAnimatedIn ? `toast-progress ${duration}ms linear forwards` : 'none',
              opacity: 0.45,
            }}
          />
        </div>
      </div>
    </div>
  )
}
