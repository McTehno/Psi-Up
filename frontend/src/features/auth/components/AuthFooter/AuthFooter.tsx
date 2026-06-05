type AuthFooterProps = {
  /** Text shown before the action link */
  prompt?: string
  /** Label for the action link/button */
  actionLabel?: string
  /** Called when the action link is clicked */
  onAction?: () => void
}

export default function AuthFooter({
  prompt = 'Če nimate računa?',
  actionLabel = 'Registracija',
  onAction,
}: AuthFooterProps) {
  return (
    <p className="text-center text-xs text-[#706b60] mt-8">
      {prompt}{' '}
      <button
        type="button"
        onClick={onAction}
        className="text-[#2C2417] font-semibold hover:text-[#31583b] hover:underline transition-all cursor-pointer"
      >
        {actionLabel}
      </button>
    </p>
  )
}


