"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Ambassador, Moderator, getAmbassadorData } from './supabase'
import { validateJWT } from './jwt-utils'

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  avatar_url?: string
  role?: 'admin' | 'moderator' | 'ambassador' | 'member'
  created_at: string
}

interface AuthContextType {
  user: User | null
  ambassador: Ambassador | null
  moderator: Moderator | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isAmbassador: boolean
  isModerator: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [moderator, setModerator] = useState<Moderator | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Memoized role checks for performance
  const isAmbassador = useMemo(() => user?.role === 'ambassador', [user?.role])
  const isModerator = useMemo(() => user?.role === 'moderator', [user?.role])
  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role])

  useEffect(() => {
    // Get initial session and role data - SIMPLIFIED VERSION
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Initializing auth context...')

        // PRIMARY: Check middleware headers (set by server-side middleware)
        const userAuthenticated = document.querySelector('meta[name="x-user-authenticated"]')?.getAttribute('content')
        const userRoleHeader = document.querySelector('meta[name="x-user-role"]')?.getAttribute('content')
        const userEmailHeader = document.querySelector('meta[name="x-user-email"]')?.getAttribute('content')

        console.log('[AuthContext] Middleware headers - Auth:', userAuthenticated, 'Role:', userRoleHeader, 'Email:', userEmailHeader)

        if (userAuthenticated === 'true' && userRoleHeader && userEmailHeader) {
          // Use middleware data as primary source
          const userData = {
            id: '', // Will be filled from Supabase if available
            email: userEmailHeader,
            full_name: '',
            avatar_url: '',
            role: userRoleHeader as 'admin' | 'moderator' | 'ambassador' | 'member',
            created_at: new Date().toISOString(),
          }

          // Try to get additional data from Supabase
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session?.user) {
            userData.id = session.user.id
            userData.full_name = session.user.user_metadata?.full_name
            userData.avatar_url = session.user.user_metadata?.avatar_url
            userData.created_at = session.user.created_at
          }

          setUser(userData)
          console.log('[AuthContext] ✓ Auth initialized from middleware - Role:', userData.role, 'Email:', userData.email)

          // Fetch role-specific data
          if (userData.role === 'ambassador' && userData.id) {
            const ambassadorData = await getAmbassadorData(userData.id)
            setAmbassador(ambassadorData)
          } else if (userData.role === 'moderator') {
            // For moderators, we might not have Supabase data, but that's ok
            console.log('[AuthContext] ✓ Moderator role set from middleware')
          }

          setLoading(false)
          return
        }

        // FALLBACK: Check JWT cookie directly (if middleware headers not available)
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1]

        if (authToken) {
          const jwtValidation = validateJWT(authToken)
          if (jwtValidation.valid && jwtValidation.payload) {
            const userData = {
              id: jwtValidation.payload.sub,
              email: jwtValidation.payload.email,
              full_name: '',
              avatar_url: '',
              role: jwtValidation.payload.role as 'admin' | 'moderator' | 'ambassador' | 'member',
              created_at: new Date().toISOString(),
            }
            setUser(userData)
            console.log('[AuthContext] ✓ Auth initialized from JWT fallback - Role:', userData.role, 'Email:', userData.email)

            // Fetch role-specific data
            if (userData.role === 'ambassador') {
              const ambassadorData = await getAmbassadorData(userData.id)
              setAmbassador(ambassadorData)
            }
          }
        }

        // If no auth found, user is not authenticated
        console.log('[AuthContext] ✗ No authentication found')
        setUser(null)
        setAmbassador(null)
        setModerator(null)

      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setAmbassador(null)
        setModerator(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes (keep minimal)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state change:', event, !!session)

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setAmbassador(null)
          setModerator(null)
          setLoading(false)
          return
        }

        // On sign in, refresh the auth context
        if (event === 'SIGNED_IN' && session?.user) {
          // Re-run initialization to get updated data
          await getInitialSession()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName?.trim(),
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error refreshing user:', error)
        setUser(null)
      } else if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          created_at: user.created_at,
        })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    ambassador,
    moderator,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    isAmbassador,
    isModerator,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { user, loading }
}
