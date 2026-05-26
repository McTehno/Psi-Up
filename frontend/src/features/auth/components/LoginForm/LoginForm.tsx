import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'

type LoginFormProps = {
  /** Called with email and password when form is submitted. Ready for API hookup. */
  onSubmit?: (email: string, password: string, rememberMe: boolean) => void
  /** Called when "Forgot password?" is clicked */
  onForgotPassword?: () => void
}

export default function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onSubmit?.(email, password, rememberMe)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-semibold text-[#2C2417]">
          E-poštni naslov
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Vnesite e-poštni naslov"
            className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-sm font-semibold text-[#2C2417]">
          Geslo
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Vnesite geslo"
            className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={rememberMe}
            onClick={() => setRememberMe((v) => !v)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span
              className={[
                'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-300',
                rememberMe
                  ? 'bg-[#31583b] border-[#31583b]'
                  : 'bg-[#d4c9b8] border-[#c2b49e]',
              ].join(' ')}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-300',
                  rememberMe ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                ].join(' ')}
              />
            </span>
            <span className="text-xs text-[#706b60] group-hover:text-[#2C2417] transition-colors select-none">
              Zapomni si me
            </span>
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-[#706b60] hover:text-[#31583b] transition-colors duration-300 cursor-pointer"
          >
            Ste pozabili geslo?
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#31583b] text-white text-sm font-semibold rounded-xl py-3.5 mt-4 hover:bg-[#2f4a31] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#31583b]/20 cursor-pointer"
      >
        Prijava
      </button>
    </form>
  )
}

