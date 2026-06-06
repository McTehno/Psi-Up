import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const fallbackTitles: Record<string, string> = {
  '/': 'NIDiKo',
  '/home-backup': 'NIDiKo',
  '/about': 'O projektu | NIDiKo',
  '/search': 'Iskanje | NIDiKo',
  '/assessment': 'Vprašalnik | NIDiKo',
  '/path': 'Rezultat učne poti | NIDiKo',
  '/detail-template': 'Predloga podrobnosti | NIDiKo',
  '/dashboard': 'Nadzorna plošča | NIDiKo',
}

function getFallbackTitle(pathname: string) {
  if (fallbackTitles[pathname]) {
    return fallbackTitles[pathname]
  }

  if (pathname.startsWith('/learning-paths/')) {
    return 'Učna pot | NIDiKo'
  }

  if (pathname.startsWith('/modules/')) {
    return 'Modul | NIDiKo'
  }

  if (pathname.startsWith('/learning-units/')) {
    return 'Učna enota | NIDiKo'
  }

  return 'NIDiKo'
}

export default function PageTitleManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = getFallbackTitle(pathname)
  }, [pathname])

  return null
}