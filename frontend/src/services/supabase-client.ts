import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL ali Anon Key nista nastavljena. Prosimo, preverite .env datoteko.'
  )
}

// Lastni storage wrapper
const customStorage = {
  getItem: (key: string): string | null => {
    // Vrene iz localStorage ce je na voljo, drugace sessionStorage
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
  },
  setItem: (key: string, value: string): void => {
    // Prebere uporabnikove preference med prijavo
    const rememberMe = window.localStorage.getItem('rememberMe') === 'true'
    
    if (rememberMe) {
      window.localStorage.setItem(key, value)
      window.sessionStorage.removeItem(key) // Pobrise old sessionStorage
    } else {
      window.sessionStorage.setItem(key, value)
      window.localStorage.removeItem(key) // Pobrise old localStorage
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


