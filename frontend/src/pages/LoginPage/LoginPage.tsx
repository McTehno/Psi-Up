import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

import {
  AuthHeader,
  AuthFooter,
  AuthDivider,
  LoginForm,
  GoogleLoginButton,
} from '../../features/auth'

// Using relative path to the image as it is now in src/assets
import bgImage from '../../assets/login-background-mountains-temp.png'

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
    <div
      className="fixed inset-0 z-50 flex min-h-screen bg-cover bg-center justify-start"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Glassmorphism panel covering left side */}
      <div
        className="relative w-full md:w-1/2 lg:w-[45%] xl:w-[40%] h-full flex flex-col justify-center px-8 lg:px-12 bg-[#fffdf8]/30 backdrop-blur-md border-r border-[#ded5c6]/60 shadow-[8px_0_32px_0_rgba(44,36,23,0.15)] animate-in fade-in slide-in-from-left-8 duration-700 ease-out overflow-y-auto"
      >
        <div className="w-full max-w-sm mx-auto relative pt-12 pb-12">
          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute -top-4 right-0 p-2 text-[#706b60] hover:text-[#2C2417] hover:bg-[#fffdf8]/50 rounded-full transition-colors duration-300 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <AuthHeader
            title="Dobrodošli nazaj"
            subtitle="Prijavite se za nadaljevanje."
          />

          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={handleForgotPassword}
          />

          <AuthDivider />

          <GoogleLoginButton onClick={handleGoogleLogin} />

          <AuthFooter onAction={handleRegister} />
        </div>
      </div>
    </div>
  )
}
