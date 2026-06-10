import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

type AuthFormProps = {
  isRegister: boolean
  onSubmit: (email: string, password: string, name?: string, rememberMe?: boolean) => void
  onForgotPassword?: () => void
  isLoading?: boolean
}

export default function AuthForm({ isRegister, onSubmit, onForgotPassword, isLoading }: AuthFormProps) {
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    onSubmit(email, password, isRegister ? name : undefined, isRegister ? undefined : rememberMe)
  }

  // Barve glede na temo
  const accentColor = isRegister ? 'text-[#d07a12]' : 'text-[#31583b]'
  const ringColor = isRegister ? 'focus:border-[#d07a12]' : 'focus:border-[#31583b]'
  const btnBg = isRegister ? 'bg-[#d07a12] hover:bg-[#b3660f]' : 'bg-[#31583b] hover:bg-[#2f4a31]'
  const btnShadow = isRegister ? 'shadow-[#d07a12]/20' : 'shadow-[#31583b]/20'
  const toggleBg = isRegister ? 'bg-[#d07a12] border-[#d07a12]' : 'bg-[#31583b] border-[#31583b]'

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      {/* Naslov polja (animacija dol in naprej) */}
      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-in-out ${
          isRegister ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`space-y-1.5 pb-1 transition-transform duration-700 ease-in-out ${isRegister ? 'translate-x-0' : 'translate-x-12'}`}>
            <label htmlFor="auth-name" className="block text-sm font-semibold text-[#2C2417]">
              Ime in priimek
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
              <input
                id="auth-name"
                name="name"
                type="text"
                placeholder="Vaše ime"
                required={isRegister}
                disabled={!isRegister}
                className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 relative z-10 bg-transparent">
        <label htmlFor="auth-email" className="block text-sm font-semibold text-[#2C2417]">
          E-poštni naslov
        </label>
        <div className="relative">
          <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
          <input
            id="auth-email"
            name="email"
            type="email"
            placeholder="Vnesite e-poštni naslov"
            required
            className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
          />
        </div>
      </div>

      <div className="space-y-1.5 relative z-10 bg-transparent">
        <label htmlFor="auth-password" className="block text-sm font-semibold text-[#2C2417]">
          Geslo
        </label>
        <div className="relative">
          <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
          <input
            id="auth-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={isRegister ? "Ustvarite geslo" : "Vnesite geslo"}
            required
            minLength={isRegister ? 6 : undefined}
            className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 pr-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all duration-300 cursor-pointer ${accentColor} opacity-50 hover:opacity-100 hover:bg-black/[0.04]`}
            aria-label={showPassword ? 'Skrij geslo' : 'Prikaži geslo'}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" strokeWidth={2} />
              : <Eye className="w-4 h-4" strokeWidth={2} />
            }
          </button>
        </div>
        
        {/* Remember Me / Forgot Password (Fades out on register) */}
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-700 ease-in-out ${
            !isRegister ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-between pt-3 pb-1">
              <button
                type="button"
                role="switch"
                aria-checked={rememberMe}
                onClick={() => setRememberMe((v) => !v)}
                disabled={isRegister}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <span
                  className={[
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-300',
                    rememberMe ? toggleBg : 'bg-[#d4c9b8] border-[#c2b49e]',
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
                disabled={isRegister}
                className="text-xs font-medium text-[#706b60] hover:text-[#31583b] transition-colors duration-300 cursor-pointer"
              >
                Ste pozabili geslo?
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white text-sm font-semibold rounded-xl py-3.5 mt-2 transition-all duration-700 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${btnBg} ${btnShadow}`}
      >
        {isLoading 
          ? (isRegister ? 'Registracija...' : 'Prijava...') 
          : (isRegister ? 'Ustvari račun' : 'Prijava')}
      </button>
    </form>
  )
}


