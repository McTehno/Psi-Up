import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL ali Anon Key nista nastavljena. Prosimo, preverite .env datoteko.'
  )
}

// Custom storage wrapper
const customStorage = {
  getItem: (key: string): string | null => {
    // Return from localStorage if available, otherwise sessionStorage
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
  },
  setItem: (key: string, value: string): void => {
    // Read user's preference set during login
    const rememberMe = window.localStorage.getItem('rememberMe') === 'true'
    
    if (rememberMe) {
      window.localStorage.setItem(key, value)
      window.sessionStorage.removeItem(key) // Clean up any old sessionStorage
    } else {
      window.sessionStorage.setItem(key, value)
      window.localStorage.removeItem(key) // Clean up any old localStorage
    }
  },
  removeItem: (key: string): void => {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
  }
})


