import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../services/supabase-client'
import { Toast } from '../../features/auth'
import loginBgImage from '../../assets/login-background-mountains.webp'
import { usePageTitle } from '../../hooks/usePageTitle'
export default function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  usePageTitle('NIDiKo')
  // Pocaka na Supabase da procesira URL hash in vzpostavi sejo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSessionReady(true)
      } else {
        // Morda bomo morali pocakati na onAuthStateChange ce se hash ni prisoten
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || session) {
            setIsSessionReady(true)
          }
        })
        return () => subscription.unsubscribe()
      }
    })
  }, [])

  function translateAuthError(msg: string): string {
    const translations: Record<string, string> = {
      'New password should be different from the old password.': 'Novo geslo se mora razlikovati od starega.',
      'Password should be at least 6 characters': 'Geslo mora imeti vsaj 6 znakov.',
      'Auth session missing!': 'Seja je potekla. Prijavite se znova.',
    }
    for (const [en, sl] of Object.entries(translations)) {
      if (msg.toLowerCase().includes(en.toLowerCase())) return sl
    }
    return 'Prišlo je do napake. Poskusite znova.'
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setToastMessage('Gesli se ne ujemata.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setToastMessage('Geslo je bilo uspešno spremenjeno.')
      // Pocaka za trenutek da uporabnik prebere toeast in ga redirecta
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err: unknown) {
      setToastMessage(translateAuthError(err instanceof Error ? err.message : ''))
    } finally {
      setIsLoading(false)
    }
  }

  const ringColor = 'focus:border-[#31583b]'
  const btnBg = 'bg-[#31583b] hover:bg-[#2f4a31]'
  const btnShadow = 'shadow-[#31583b]/20'
  const accentColor = 'text-[#31583b]'

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden bg-sand-50">
      <Toast
        message={toastMessage}
        variant={toastMessage === 'Geslo je bilo uspešno spremenjeno.' ? 'success' : 'error'}
        duration={5000}
        onDismiss={() => setToastMessage(null)}
      />
      <div
        className="relative w-full max-w-[920px] overflow-hidden rounded-3xl shadow-2xl shadow-brown-900/20 border border-sand-300/60 animate-fade-in-up bg-[#fffdf8]"
        style={{ height: 'min(85vh, 600px)' }}
      >
        <div
          className="absolute inset-0 w-full h-full z-0 opacity-100"
          style={{
            backgroundImage: `url(${loginBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute top-0 bottom-0 w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-12 bg-[#fffdf8]/65 backdrop-blur-xl z-20 border-r border-[#ded5c6]/60">
          <div className="w-full max-w-sm mx-auto relative z-10">
            <div className="mb-2">
              <h1 className={`font-serif text-3xl font-semibold tracking-tight text-[#2f4a31]`}>
                Ponastavitev gesla
              </h1>
            </div>

            <p className="text-[#706b60] text-sm mb-8">
              Vnesite novo geslo. Geslo mora vsebovati vsaj 6 znakov.
            </p>

            {!isSessionReady ? (
              <p className="text-[#706b60] text-sm animate-pulse">Priprava seje...</p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5 relative z-10 bg-transparent">
                  <label htmlFor="auth-password" className="block text-sm font-semibold text-[#2C2417]">
                    Novo geslo
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
                    <input
                      id="auth-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Vnesite novo geslo"
                      required
                      minLength={6}
                      className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 pr-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all duration-300 cursor-pointer ${accentColor} opacity-50 hover:opacity-100 hover:bg-black/[0.04]`}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 relative z-10 bg-transparent">
                  <label htmlFor="auth-confirm-password" className="block text-sm font-semibold text-[#2C2417]">
                    Potrdite novo geslo
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700 ${accentColor}`} />
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ponovno vnesite novo geslo"
                      required
                      minLength={6}
                      className={`w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none ${ringColor} transition-all duration-300`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white text-sm font-semibold rounded-xl py-3.5 mt-2 transition-all duration-700 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${btnBg} ${btnShadow}`}
                >
                  {isLoading ? 'Shranjevanje...' : 'Spremeni geslo'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




