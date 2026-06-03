import { Mail, Lock, User } from 'lucide-react'

type RegisterFormProps = {
  /** Called when form is submitted. */
  onSubmit?: (name: string, email: string, password: string) => void
  /** Error message to display */
  error?: string | null
  /** Is the form currently submitting? */
  isLoading?: boolean
}

export default function RegisterForm({ onSubmit, error, isLoading }: RegisterFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onSubmit?.(name, email, password)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      <div className="space-y-1.5">
        <label htmlFor="register-name" className="block text-sm font-semibold text-[#2C2417]">
          Ime in priimek
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
          <input
            id="register-name"
            name="name"
            type="text"
            placeholder="Vaše ime"
            required
            className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className="block text-sm font-semibold text-[#2C2417]">
          E-poštni naslov
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="Vnesite e-poštni naslov"
            required
            className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="block text-sm font-semibold text-[#2C2417]">
          Geslo
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Ustvarite geslo"
            required
            minLength={6}
            className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#31583b] text-white text-sm font-semibold rounded-xl py-3.5 mt-4 hover:bg-[#2f4a31] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#31583b]/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registracija...' : 'Ustvari račun'}
      </button>
    </form>
  )
}
