import { createContext } from 'react'

import type { Session, User } from '@supabase/supabase-js'

import type { UserResponse } from '../../../types/user'

export type AuthContextType = {
  session: Session | null
  user: User | null
  localUser: UserResponse | null
  isLoading: boolean
  updateLocalUser: (updatedUser: UserResponse) => void
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  localUser: null,
  isLoading: true,
  updateLocalUser: () => {},
})

