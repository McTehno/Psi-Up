import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock } from 'lucide-react';

// Using relative path to the image as it is now in src/assets
import bgImage from '../../assets/login-background-mountains.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Container with Glassmorphism */}
      <div
        className="relative w-full max-w-sm p-7 overflow-hidden rounded-3xl bg-[#fffdf8]/30 backdrop-blur-md border border-[#ded5c6]/60 shadow-[0_8px_32px_0_rgba(44,36,23,0.15)] animate-in fade-in zoom-in-95 duration-700 ease-out"
      >
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 p-2 text-[#706b60] hover:text-[#2C2417] hover:bg-[#fffdf8]/50 rounded-full transition-colors duration-300 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2C2417] mb-1.5">Dobrodošli nazaj</h1>
          <p className="text-[#706b60] text-sm">Prijavite se za nadaljevanje</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
              <input
                type="email"
                placeholder="E-poštni naslov"
                className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#31583b]" />
              <input
                type="password"
                placeholder="Geslo"
                className="w-full bg-[#fffdf8]/50 border border-[#ded5c6] text-[#2C2417] placeholder-[#706b60] rounded-xl px-11 py-3 text-sm outline-none focus:bg-[#fffdf8]/80 focus:border-[#31583b] transition-all duration-300"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button type="button" className="text-xs text-[#706b60] hover:text-[#31583b] transition-colors duration-300 cursor-pointer">
                Ste pozabili geslo?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#31583b] text-white text-sm font-semibold rounded-xl py-3 mt-2 hover:bg-[#2f4a31] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#31583b]/20 cursor-pointer"
          >
            Prijava
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#ded5c6]"></div>
          <span className="px-4 text-[11px] text-[#706b60] uppercase tracking-wider font-medium">Ali nadaljujte z</span>
          <div className="flex-1 border-t border-[#ded5c6]"></div>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={() => console.log('Google login clicked')}
          className="w-full flex items-center justify-center gap-2.5 bg-[#fffdf8]/60 border border-[#ded5c6] text-[#2C2417] text-sm font-medium rounded-xl py-2.5 hover:bg-[#fffdf8]/90 hover:border-[#31583b]/30 active:scale-[0.98] transition-all duration-300 shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#31583b]" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Prijava z Googlom
        </button>

        {/* Register Link */}
        <p className="text-center text-xs text-[#706b60] mt-6">
          Še nimate računa?{' '}
          <button type="button" className="text-[#2C2417] font-semibold hover:text-[#31583b] hover:underline transition-all cursor-pointer">
            Registracija
          </button>
        </p>
      </div>
    </div>
  );
}
