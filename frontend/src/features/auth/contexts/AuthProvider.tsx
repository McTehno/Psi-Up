import React, { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '../../../services/supabase-client'
import { createUserProfile, updateUser } from '../../../services/user-service'
import type { UserResponse } from '../../../types/user'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [localUser, setLocalUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function syncLocalUser(supabaseUser: User | null) {
    if (!supabaseUser) {
      setLocalUser(null)
      return
    }

    try {
      const profile = await createUserProfile({
        auth_provider: 'supabase',
        auth_user_id: supabaseUser.id,
        email: supabaseUser.email,
      })

      if (supabaseUser.email && profile.email !== supabaseUser.email) {
        const updatedProfile = await updateUser(profile._id, {
          email: supabaseUser.email,
        })

        setLocalUser(updatedProfile)
        return
      }

      setLocalUser(profile)
    } catch (err) {
      console.error('Failed to sync local user profile:', err)
      setLocalUser(null)
    }
  }

  function updateLocalUser(updatedUser: UserResponse) {
    setLocalUser(updatedUser)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      syncLocalUser(session?.user ?? null).finally(() => setIsLoading(false))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        sessionStorage.clear()
        localStorage.clear()
      }

      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(true)
      syncLocalUser(session?.user ?? null).finally(() => setIsLoading(false))
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        localUser,
        isLoading,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}







