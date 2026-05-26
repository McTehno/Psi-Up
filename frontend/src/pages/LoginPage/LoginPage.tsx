import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

import { supabase } from '../../services/supabase-client'

import {
  AuthFooter,
  AuthDivider,
  AuthForm,
  GoogleLoginButton,
} from '../../features/auth'

// Using relative path to the image as it is now in src/assets
import loginBgImage from '../../assets/login-background-mountains.jpeg'
import registerBgImage from '../../assets/register-background-mountains.jpeg'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  // -- Handlers --
  async function handleSubmit(email: string, password: string, name?: string, _rememberMe?: boolean) {
    setIsLoading(true)
    setError(null)
    
    try {
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
      
      // On success (assuming auto-confirm is enabled for register)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Prišlo je do napake.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    console.log('Google login clicked')
  }

  function handleForgotPassword() {
    console.log('Forgot password clicked')
  }

  function toggleMode() {
    setIsRegister(!isRegister)
    setError(null)
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden bg-sand-50">
      {/* Large centered window containing the entire login/register experience */}
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl shadow-brown-900/20 border border-sand-300/60 animate-fade-in-up bg-[#fffdf8]"
        style={{ height: 'min(85vh, 720px)' }}
      >
        {/* Login Background Image Wrapper */}
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isRegister ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url(${loginBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Register Background Image Wrapper */}
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isRegister ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${registerBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Sliding Frosted Glass Panel */}
        <div
          className={`absolute top-0 bottom-0 w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-12 bg-[#fffdf8]/65 backdrop-blur-xl transition-transform duration-700 ease-in-out z-20 ${
            isRegister ? 'md:translate-x-full border-l border-[#ded5c6]/60' : 'translate-x-0 border-r border-[#ded5c6]/60'
          }`}
          style={{ willChange: 'transform' }}
        >
          <div className="w-full max-w-sm mx-auto relative z-10 transition-opacity duration-500">
            {/* Title row with close button inline */}
            <div className="flex items-start justify-between mb-2">
              <h1 className={`text-3xl font-semibold tracking-tight transition-colors duration-700 ${isRegister ? 'text-[#8b5a2b]' : 'text-[#2f4a31]'}`}>
                {isRegister ? 'Ustvarite račun' : 'Dobrodošli nazaj'}
              </h1>
              <button
                onClick={() => navigate(-1)}
                className="p-2 -mr-2 -mt-1 text-[#706b60] hover:text-[#2C2417] hover:bg-[#fffdf8]/50 rounded-full transition-colors duration-300 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[#706b60] text-sm mb-8 transition-opacity duration-500 delay-100">
              {isRegister ? 'Pridružite se in začnite svojo učno pot.' : 'Prijavite se za nadaljevanje.'}
            </p>

            <div className="relative">
              {/* Unified Auth Form */}
              <AuthForm
                isRegister={isRegister}
                onSubmit={handleSubmit}
                onForgotPassword={handleForgotPassword}
                error={error}
                isLoading={isLoading}
              />
            </div>

            <AuthDivider label={isRegister ? 'Ali se registrirajte z' : 'Ali nadaljujte z'} />

            <GoogleLoginButton onClick={handleGoogleLogin} />

            <AuthFooter 
              prompt={isRegister ? 'Že imate račun?' : 'Še nimate računa?'}
              actionLabel={isRegister ? 'Prijava' : 'Registracija'}
              onAction={toggleMode} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
