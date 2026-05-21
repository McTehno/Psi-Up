import type { ReactNode } from 'react'

type DetailAction = {
  label: string
  onClick?: () => void
  icon?: ReactNode
  variant?: 'primary' | 'secondary'
}

type DetailActionsProps = {
  actions: DetailAction[]
}

function DetailActions({ actions }: DetailActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const className =
          action.variant === 'primary'
            ? 'bg-forest-600 text-white hover:bg-forest-700'
            : 'bg-sand-100 text-brown-800 hover:bg-sand-200'

        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${className}`}
          >
            {action.icon}
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

export default DetailActions