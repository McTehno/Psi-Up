import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

import { supabase } from '../../services/supabase-client'

import {
  AuthFooter,
  AuthDivider,
  AuthForm,
  GoogleLoginButton,
  Toast,
  ForgotPasswordForm,
} from '../../features/auth'

import {usePageTitle} from '../../hooks/usePageTitle'
// Using relative path to the image as it is now in src/assets
import loginBgImage from '../../assets/login-background-mountains.jpeg'
import registerBgImage from '../../assets/register-background-mountains.jpeg'

export default function LoginPage() {
  usePageTitle('Prijava')

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(location.pathname === '/register')
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  // Slovenian translations for common Supabase auth errors, this is unfortunately not an option through supabase :(
  function translateAuthError(msg: string): string {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Napačen e-poštni naslov ali geslo.',
      'Email not confirmed': 'E-poštni naslov še ni potrjen. Preverite svoj nabiralnik.',
      'User already registered': 'Uporabnik s tem e-poštnim naslovom že obstaja.',
      'Signup requires a valid password': 'Geslo mora imeti vsaj 6 znakov.',
      'Password should be at least 6 characters': 'Geslo mora imeti vsaj 6 znakov.',
      'Unable to validate email address: invalid format': 'Neveljaven format e-poštnega naslova.',
      'Email rate limit exceeded': 'Preveč poskusov. Počakajte nekaj minut in poskusite znova.',
      'For security purposes, you can only request this after 60 seconds.': 'Iz varnostnih razlogov počakajte 60 sekund pred ponovnim poskusom.',
      'Auth session missing!': 'Seja je potekla. Prijavite se znova.',
      'New password should be different from the old password.': 'Novo geslo se mora razlikovati od starega.',
      'User not found': 'Uporabnik s tem e-poštnim naslovom ne obstaja.',
    }

    for (const [en, sl] of Object.entries(translations)) {
      if (msg.toLowerCase().includes(en.toLowerCase())) return sl
    }

    return 'Prišlo je do napake. Poskusite znova.'
  }

  // -- Handlers --
  async function handleSubmit(email: string, password: string, name?: string, rememberMe?: boolean) {
    setIsLoading(true)
    try {
      if (rememberMe !== undefined) {
        window.localStorage.setItem('rememberMe', String(rememberMe))
      } else if (isRegister) {
        window.localStorage.setItem('rememberMe', 'false')
      }

      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })
        if (error) throw error

        setToastMessage('Uspešno ste se registrirali. Zdaj se lahko prijavite.')
        setIsRegister(false)
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }

      // On success
      navigate(from, { replace: true })
    } catch (err: unknown) {
    const translated = translateAuthError(err instanceof Error ? err.message : '')
      setToastMessage(translated)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsLoading(true); // Optional: if you want to show a loading state
      window.localStorage.setItem('rememberMe', 'true') // Default to remember for OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This tells Supabase where to redirect AFTER Google validates the user
          redirectTo: `${window.location.origin}${from === '/' ? '/dashboard' : from}`,
        }
      })
      if (error) throw error
      // Note: You don't need to navigate() here. 
      // OAuth will physically redirect the user away from your app to Google, and then back.
    } catch (err: unknown) {
    const translated = translateAuthError(err instanceof Error ? err.message : '')
      setToastMessage(translated)
    } finally {
      setIsLoading(false);
    }
  }

  function handleForgotPassword() {
    setIsForgotPassword(true)
  }

  async function handleSendResetEmail(email: string) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      
      // Since our toast component handles both success and error by variant,
      // currently the variant is hardcoded to "error" in LoginPage.
      // We might need to handle success variant or just show it as error variant 
      // but let's show it. (Actually let's just use setToastMessage for now).
      setToastMessage('Povezava za ponastavitev gesla je bila poslana na vaš e-poštni naslov.')
      setIsForgotPassword(false)
    } catch (err: unknown) {
    const translated = translateAuthError(err instanceof Error ? err.message : '')
      setToastMessage(translated)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister)
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden bg-sand-50">
      <Toast
        message={toastMessage}
        variant={toastMessage === 'Povezava za ponastavitev gesla je bila poslana na vaš e-poštni naslov.' || toastMessage === 'Uspešno ste se registrirali. Zdaj se lahko prijavite.' ? 'success' : 'error'}
        duration={5000}
        onDismiss={() => setToastMessage(null)}
      />
      {/* Large centered window containing the entire login/register experience */}
      <div
        className="relative w-full max-w-[920px] overflow-hidden rounded-3xl shadow-2xl shadow-brown-900/20 border border-sand-300/60 animate-fade-in-up bg-[#fffdf8]"
        style={{ height: 'min(85vh, 600px)' }}
      >
        {/* Login Background Image Wrapper */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 ${isRegister ? 'opacity-0' : 'opacity-100'
            }`}
          style={{
            backgroundImage: `url(${loginBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Register Background Image Wrapper */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 ${isRegister ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            backgroundImage: `url(${registerBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Sliding Frosted Glass Panel */}
        <div
          className={`absolute top-0 bottom-0 w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-12 bg-[#fffdf8]/65 backdrop-blur-xl transition-transform duration-700 ease-in-out z-20 ${isRegister ? 'md:translate-x-full border-l border-[#ded5c6]/60' : 'translate-x-0 border-r border-[#ded5c6]/60'
            }`}
          style={{ willChange: 'transform' }}
        >
          <div className="w-full max-w-sm mx-auto relative z-10 transition-opacity duration-500">
            {/* Title row with close button inline */}
            <div className="flex items-center justify-between mb-2">
              <h1 className={`font-serif text-3xl font-semibold tracking-tight transition-colors duration-700 ${isRegister ? 'text-[#d07a12]' : 'text-[#2f4a31]'}`}>
                {isForgotPassword ? 'Ponastavitev gesla' : isRegister ? 'Ustvarite račun' : 'Dobrodošli nazaj'}
              </h1>
              <button
                onClick={() => navigate(-1)}
                className="p-2 -mr-2 text-[#706b60] hover:text-[#2C2417] hover:bg-[#fffdf8]/50 rounded-full transition-colors duration-300 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-[#706b60] text-sm transition-all duration-700 ease-in-out ${isRegister ? 'mb-4' : 'mb-8'}`}>
              {isForgotPassword ? 'Vnesite e-poštni naslov za ponastavitev.' : isRegister ? 'Pridružite se in začnite svojo učno pot.' : 'Prijavite se za nadaljevanje.'}
            </p>

            <div className="relative">
              {/* Unified Auth Form */}
              {isForgotPassword ? (
                <ForgotPasswordForm
                  onSubmit={handleSendResetEmail}
                  isLoading={isLoading}
                  onCancel={() => setIsForgotPassword(false)}
                />
              ) : (
                <AuthForm
                  isRegister={isRegister}
                  onSubmit={handleSubmit}
                  onForgotPassword={handleForgotPassword}
                  isLoading={isLoading}
                />
              )}
            </div>

            {!isForgotPassword && (
              <>
                <AuthDivider label={isRegister ? 'Ali se registrirajte z' : 'Ali nadaljujte z'} />

                <GoogleLoginButton onClick={handleGoogleLogin} />

                <AuthFooter
                  prompt={isRegister ? 'Če imate račun?' : 'Če nimate računa?'}
                  actionLabel={isRegister ? 'Prijava' : 'Registracija'}
                  onAction={toggleMode}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




