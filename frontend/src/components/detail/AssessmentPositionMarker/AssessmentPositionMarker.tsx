import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

type AssessmentPositionTone = 'current' | 'recommended'

type AssessmentPositionMarkerProps = {
  label?: string
  tone?: AssessmentPositionTone
  className?: string
}

type ToneClassNames = {
  ping: string
  halo: string
  marker: string
  tail: string
}

const COMPACT_VIEWPORT_QUERY = '(max-width: 1499px)'

function useIsCompactViewport() {
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY)

    const handleChange = () => {
      setIsCompactViewport(mediaQuery.matches)
    }

    handleChange()

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isCompactViewport
}

function getToneClassNames(isCompactViewport: boolean): Record<AssessmentPositionTone, ToneClassNames> {
  return {
    current: isCompactViewport
      ? {
          ping: 'bg-[#31583b]/20',
          halo: 'bg-[#31583b]/10',
          marker:
            'border-[#31583b]/70 bg-white/35 text-[#31583b] backdrop-blur-sm shadow-[0_8px_18px_rgba(49,88,59,0.16)]',
          tail: 'bg-[#31583b]/40',
        }
      : {
          ping: 'bg-[#31583b]/20',
          halo: 'bg-[#31583b]/0',
          marker: 'border-[#31583b]/0 bg-white/0 text-[#31583b]',
          tail: 'bg-[#000000]/0',
        },
    recommended: {
      ping: 'bg-[#31583b]/25',
      halo: 'bg-[#31583b]/15',
      marker:
        'border-[#31583b]/80 bg-[#31583b] text-[#fffdf8] shadow-[0_10px_24px_rgba(49,88,59,0.24)]',
      tail: 'bg-[#31583b]/70',
    },
  }
}

function AssessmentPositionMarker({
  label = 'Tukaj se nahajaš',
  tone = 'current',
  className = '',
}: AssessmentPositionMarkerProps) {
  const isCompactViewport = useIsCompactViewport()
  const toneClasses = getToneClassNames(isCompactViewport)[tone]

  const wrapperSizeClassName = isCompactViewport ? 'h-9 w-9' : 'h-12 w-12'
  const pingSizeClassName = isCompactViewport ? 'h-8 w-8 rounded-xl' : 'h-10 w-10 rounded-full'
  const haloSizeClassName = isCompactViewport ? 'h-9 w-9 rounded-xl' : 'h-12 w-12 rounded-full'
  const markerSizeClassName = isCompactViewport ? 'h-7 w-7 rounded-xl' : 'h-8 w-8 rounded-full'
  const iconSizeClassName = isCompactViewport ? 'h-4 w-4' : 'h-10 w-10'

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={[
        'pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-[calc(100%+0.65rem)] items-center justify-center',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'relative flex items-center justify-center motion-safe:animate-[assessment-position-bob_2.4s_ease-in-out_infinite]',
          wrapperSizeClassName,
        ].join(' ')}
      >
        <span
          className={[
            'absolute opacity-70 motion-safe:animate-ping',
            pingSizeClassName,
            toneClasses.ping,
          ].join(' ')}
        />

        <span
          className={[
            'absolute opacity-80 motion-safe:animate-pulse',
            haloSizeClassName,
            toneClasses.halo,
          ].join(' ')}
        />

        <span
          className={[
            'relative flex items-center justify-center border transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105',
            markerSizeClassName,
            toneClasses.marker,
          ].join(' ')}
        >
          <MapPin
            className={[
              'transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105',
              iconSizeClassName,
            ].join(' ')}
          />
        </span>

        <span
          className={[
            'absolute left-1/2 top-[calc(100%+0.1rem)] h-2 w-px -translate-x-1/2 rounded-full',
            toneClasses.tail,
          ].join(' ')}
        />
      </div>
    </div>
  )
}

export default AssessmentPositionMarker