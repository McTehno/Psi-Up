import { Link } from 'react-router-dom'
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
  return (
    <header className="border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Psi-Up domov">
          <Logo />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-brown-600 transition-colors hover:text-brown-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar