// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { AuthAPI } from '../services/auth'   // ← แก้จาก ./services/auth เป็น ../services/auth

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        if (mounted) setUser(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
      if (mounted) setLoading(false)
      return
    }

    AuthAPI.me()
      .then((u) => {
        if (mounted && u) {
          setUser(u)
          localStorage.setItem('user', JSON.stringify(u))
        }
      })
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  async function login(username, password) {
    const userData = await AuthAPI.login(username, password)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  async function logout() {
    try {
      await AuthAPI.logout()
    } catch (e) {
      console.warn('Logout API failed:', e)
    }
    localStorage.removeItem('user')
    setUser(null)
  }

  async function refresh() {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
    }),
    [user, loading]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
