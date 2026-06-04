import { Outlet } from 'react-router-dom'

import AppShell from '../components/layout/AppShell'
import { SearchProvider } from '../contexts/SearchProvider'

export function RootLayout() {
  return (
    <SearchProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </SearchProvider>
  )
}

