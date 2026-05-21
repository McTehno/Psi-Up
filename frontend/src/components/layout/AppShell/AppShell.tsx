import type { ReactNode } from 'react'
import Navbar from '../Navbar'
import Footer from '../Footer'

type AppShellProps = {
  children: ReactNode
  showNavbar?: boolean
  showFooter?: boolean
}

function AppShell({
  children,
  showNavbar = true,
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-sand-50 text-brown-900">
      {showNavbar && <Navbar />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}

export default AppShell