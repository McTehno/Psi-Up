import { Mail } from 'lucide-react'

type ForgotPasswordFormProps = {
  onSubmit: (email: string) => void
  isLoading?: boolean
  onCancel: () => void
}

export default function ForgotPasswordForm({ onSubmit, isLoading, onCancel }: ForgotPasswordFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    onSubmit(email)
  }

  const ringColor = 'focus:border-[#31583b]'
  const btnBg = 'bg-[#31583b] hover:bg-[#2f4a31]'
  const btnShadow = 'shadow-[#31583b]/20'
  const accentColor = 'text-[#31583b]'

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5 relative z-10 bg-transparent">
        <label htmlFor="reset-email" className="block text-sm font-semibold text-[#2C2417]">
          Vaš e-poštni naslov
        </label>
        <div className="relative">
          <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
          <input
            id="reset-email"
            name="email"
            type="email"
            placeholder="Vnesite e-poštni naslov"
            required
            className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
          />
        </div>
        <p className="text-xs text-[#706b60] mt-2">
          Vnesite vaš e-poštni naslov in poslali vam bomo povezavo za ponastavitev gesla.
        </p>
      </div>

      <div className="pt-2 flex flex-col space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full text-white text-sm font-semibold rounded-xl py-3.5 transition-all duration-700 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${btnBg} ${btnShadow}`}
        >
          {isLoading ? 'Pošiljanje...' : 'Pošlji povezavo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full text-[#706b60] hover:text-[#2C2417] text-sm font-semibold rounded-xl py-2.5 transition-all duration-300 cursor-pointer disabled:opacity-70"
        >
          Prekliči
        </button>
      </div>
    </form>
  )
}
