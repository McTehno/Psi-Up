import { Link, useLocation } from 'react-router-dom'
import Logo from '../Logo'

type NavbarLink = {
  label: string
  to: string
}

type NavbarProps = {
  links?: NavbarLink[]
}

const defaultLinks: NavbarLink[] = [
  { label: 'Domov', to: '/' },
  { label: 'Iskanje', to: '/search' },
  { label: 'Vprašalnik', to: '/assessment' },
]

function Navbar({ links = defaultLinks }: NavbarProps) {
  const location = useLocation()

  return (
    <header className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 rounded-full p-[1px] bg-gradient-to-b from-white/80 to-brown-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-500">
      <nav className="relative flex items-center justify-between rounded-full bg-sand-50/40 px-4 py-3 backdrop-blur-xl transition-colors duration-500 hover:bg-sand-50/50">
        
        {/* Logo - Full Left */}
        <div className="flex shrink-0 items-center pl-1">
          <Link 
            to="/" 
            aria-label="Psi-Up domov"
            className="group relative flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <Logo 
              hideLabel 
              iconContainerClassName="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-sand-200 transition-all duration-300 group-hover:bg-sand-50 group-hover:shadow-md"
              iconClassName="h-6 w-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            />
          </Link>
        </div>

        {/* Links - Centered */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative px-2 py-1 text-[15px] font-bold tracking-wide transition-all duration-300 ${
                  isActive 
                    ? 'text-brown-900' 
                    : 'text-brown-700 hover:text-brown-900 hover:-translate-y-0.5'
                }`}
              >
                {link.label}
                
                {/* Active/Hover Indicator */}
                <span 
                  className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'w-1.5 h-1.5 bg-terracotta-500 opacity-100 scale-100' 
                      : 'bg-brown-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'
                  }`} 
                />
              </Link>
            )
          })}
        </div>

        {/* Empty space for flex balance on the right */}
        <div className="hidden h-11 w-12 shrink-0 md:block"></div>
      </nav>
    </header>
  )
}

export default Navbar