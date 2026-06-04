import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type DashboardModalProps = {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export default function DashboardModal({
  title,
  description,
  children,
  onClose,
}: DashboardModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 backdrop-blur-md sm:pt-24"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="dashboard-modal-card relative w-full max-w-md rounded-[28px] border border-[#eadfce]/70 bg-[#fffdf8]/80 p-5 shadow-[0_24px_80px_rgba(57,47,35,0.16)] backdrop-blur-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfce]/80 bg-[#fffdf8]/70 text-[#8b7c65] shadow-sm transition-all duration-300 hover:border-[#d07a12]/40 hover:bg-[#fff6eb] hover:text-[#d07a12] active:scale-95"
          aria-label="Zapri modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d07a12]">
            Dashboard
          </p>
          <h2
            id="dashboard-modal-title"
            className="mt-2 font-display text-2xl font-bold tracking-tight text-[#2C2417]"
          >
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm leading-6 text-[#8b7c65]">
              {description}
            </p>
          )}
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

