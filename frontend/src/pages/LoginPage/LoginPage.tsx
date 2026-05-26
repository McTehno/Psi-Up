import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

import {
  AuthFooter,
  AuthDivider,
  LoginForm,
  GoogleLoginButton,
} from '../../features/auth'

// Using relative path to the image as it is now in src/assets
import bgImage from '../../assets/login-background-mountains.jpeg'

export default function LoginPage() {
  const navigate = useNavigate()

  // Handlers — ready for API service integration
  function handleLogin(email: string, password: string, rememberMe: boolean) {
    // TODO: call auth service (e.g. authService.login(email, password, rememberMe))
    console.log('Login submitted:', { email, password, rememberMe })
  }

  function handleGoogleLogin() {
    // TODO: call auth service for Google OAuth flow
    console.log('Google login clicked')
  }

  function handleForgotPassword() {
    // TODO: navigate to forgot-password page or open modal
    console.log('Forgot password clicked')
  }

  function handleRegister() {
    // TODO: navigate to registration page
    console.log('Register clicked')
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Large centered window containing the entire login experience */}
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl shadow-brown-900/15 border border-sand-300/60 animate-fade-in-up"
        style={{ height: 'min(85vh, 720px)' }}
      >
        <div className="flex h-full">
          {/* Left side — Glassmorphism login panel */}
          <div
            className="relative w-full md:w-1/2 lg:w-[48%] h-full flex flex-col justify-center px-8 lg:px-12 bg-[#fffdf8]/30 backdrop-blur-md border-r border-[#ded5c6]/60"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
            }}
          >
            {/* Frosted glass overlay on top of the background */}
            <div className="absolute inset-0 bg-[#fffdf8]/60 backdrop-blur-xl" />

            <div className="w-full max-w-sm mx-auto relative z-10">
              {/* Title row with close button inline */}
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2f4a31]">
                  Dobrodošli nazaj
                </h1>
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -mr-2 -mt-1 text-[#706b60] hover:text-[#2C2417] hover:bg-[#fffdf8]/50 rounded-full transition-colors duration-300 cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#706b60] text-sm mb-8">
                Prijavite se za nadaljevanje.
              </p>

              <LoginForm
                onSubmit={handleLogin}
                onForgotPassword={handleForgotPassword}
              />

              <AuthDivider />

              <GoogleLoginButton onClick={handleGoogleLogin} />

              <AuthFooter onAction={handleRegister} />
            </div>
          </div>

          {/* Right side — Mountains background image */}
          <div
            className="hidden md:block md:w-1/2 lg:w-[52%] h-full"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>
    </div>
  )
}
