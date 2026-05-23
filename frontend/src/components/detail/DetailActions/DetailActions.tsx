import type { ReactNode } from 'react'
import { appStyles } from '../../../design'

type DetailAction = {
  label: string
  onClick?: () => void
  icon?: ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

type DetailActionsProps = {
  actions: DetailAction[]
  align?: 'left' | 'right' | 'between'
}

function DetailActions({ actions, align = 'left' }: DetailActionsProps) {
  if (actions.length === 0) {
    return null
  }

  const alignmentClass =
    align === 'right'
      ? 'justify-end'
      : align === 'between'
        ? 'justify-between'
        : 'justify-start'

  return (
    <div className={`flex flex-wrap gap-3 ${alignmentClass}`}>
      {actions.map((action) => {
        const className =
          action.variant === 'primary'
            ? appStyles.button.primary
            : appStyles.button.secondary

        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={className}
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