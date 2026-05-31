import { MapPin } from 'lucide-react'

type AssessmentPositionTone = 'current' | 'recommended'

type AssessmentPositionMarkerProps = {
  label?: string
  tone?: AssessmentPositionTone
  className?: string
}

const toneClassNames: Record<AssessmentPositionTone, string> = {
  current: 'border-[#d08a34] bg-[#d08a34] text-white shadow-[0_12px_28px_rgba(208,138,52,0.24)]',
  recommended:
    'border-[#31583b] bg-[#31583b] text-[#fffdf8] shadow-[0_12px_28px_rgba(49,88,59,0.22)]',
}

function AssessmentPositionMarker({
  label = 'Tukaj se nahajaš',
  tone = 'current',
  className = '',
}: AssessmentPositionMarkerProps) {
  return (
    <div
      className={[
        'pointer-events-none inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]',
        toneClassNames[tone],
        className,
      ].join(' ')}
    >
      <MapPin className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </div>
  )
}

export default AssessmentPositionMarker