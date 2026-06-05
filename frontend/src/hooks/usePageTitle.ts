import { useEffect } from 'react'

const APP_NAME = 'NIDiKo'

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    const normalizedTitle = pageTitle?.trim()

    document.title = normalizedTitle
      ? `${normalizedTitle}`
      : APP_NAME
  }, [pageTitle])
}