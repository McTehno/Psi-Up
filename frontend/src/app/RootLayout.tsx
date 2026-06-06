import { Outlet } from 'react-router-dom'

import AppShell from '../components/layout/AppShell'
import { SearchProvider } from '../contexts/SearchProvider'
import PageTitleManager from './PageTitleManager'

export function RootLayout() {
  return (
    <SearchProvider>

      <PageTitleManager />
      
      <AppShell>
        <Outlet />
      </AppShell>
    </SearchProvider>
  )
}

