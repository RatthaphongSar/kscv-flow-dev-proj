// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { AuthAPI } from '../services/auth'   // ← แก้จาก ./services/auth เป็น ../services/auth

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const accessToken = localStorage.getItem('access_token')
    const normalizedToken = (accessToken || '').toLowerCase()
    const roleFromToken = normalizedToken.includes('student')
      ? 'STUDENT'
      : normalizedToken.includes('teacher')
        ? 'TEACHER'
        : null
    const stored = localStorage.getItem('user')
    if (stored && accessToken) {
      try {
        const parsed = JSON.parse(stored)
        if (roleFromToken && parsed?.role && parsed.role.toUpperCase() !== roleFromToken) {
          localStorage.removeItem('user')
        } else {
          if (mounted) setUser(parsed)
          if (mounted) setLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    } else if (stored && !accessToken) {
      localStorage.removeItem('user')
    }

    const isMockToken = normalizedToken.includes('mock-')
    if (accessToken && isMockToken) {
      const mockRole = localStorage.getItem('mockRole') || roleFromToken || 'TEACHER'
      const mockUser = {
        id: mockRole === 'TEACHER' ? 'teacher-001' : 'student-001',
        username: mockRole === 'TEACHER' ? 'teacher' : 'student1',
        email: mockRole === 'TEACHER' ? 'teacher@university.edu' : 'student1@university.edu',
        role: mockRole,
      }
      if (mounted) {
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        setLoading(false)
      }
      return
    }

    // Development mode: Auto-login with teacher credentials
    const shouldAutoLogin = localStorage.getItem('_DEV_AUTOLOAD_TEACHER') === 'true'
    if (shouldAutoLogin && import.meta.env.MODE === 'development') {
      localStorage.removeItem('_DEV_AUTOLOAD_TEACHER')
      AuthAPI.login('teacher-demo', 'Teacher123!')
        .then((userData) => {
          if (mounted && userData) {
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            if (userData.accessToken) {
              localStorage.setItem('access_token', userData.accessToken)
            }
          }
        })
        .catch((err) => {
          console.warn('Dev auto-login failed:', err.message)
          // Fallback to mock user
          if (mounted) {
            const mockUser = {
              id: 'teacher-001',
              username: 'teacher-demo',
              email: 'teacher@university.edu',
              role: 'TEACHER',
            }
            setUser(mockUser)
            localStorage.setItem('user', JSON.stringify(mockUser))
            localStorage.setItem('access_token', 'mock-teacher-token')
          }
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
      return
    }

    if (!accessToken) {
      if (mounted) {
        setUser(null)
        setLoading(false)
      }
      return
    }

    const resolveMockRole = () => localStorage.getItem('mockRole') || roleFromToken || 'TEACHER'

    // Try to load from API
    AuthAPI.me()
      .then((u) => {
        if (mounted && u) {
          setUser(u)
          localStorage.setItem('user', JSON.stringify(u))
        } else if (mounted) {
          const mockRole = resolveMockRole()
          const mockUser = {
            id: mockRole === 'TEACHER' ? 'teacher-001' : 'student-001',
            username: mockRole === 'TEACHER' ? 'teacher' : 'student1',
            email: mockRole === 'TEACHER' ? 'teacher@university.edu' : 'student1@university.edu',
            role: mockRole,
          }
          setUser(mockUser)
          localStorage.setItem('user', JSON.stringify(mockUser))
          localStorage.setItem('access_token', `mock-${mockRole.toLowerCase()}-token`)
        }
      })
      .catch(() => {
        if (mounted) {
          const mockRole = resolveMockRole()
          const mockUser = {
            id: mockRole === 'TEACHER' ? 'teacher-001' : 'student-001',
            username: mockRole === 'TEACHER' ? 'teacher' : 'student1',
            email: mockRole === 'TEACHER' ? 'teacher@university.edu' : 'student1@university.edu',
            role: mockRole,
          }
          setUser(mockUser)
          localStorage.setItem('user', JSON.stringify(mockUser))
          localStorage.setItem('access_token', `mock-${mockRole.toLowerCase()}-token`)
        }
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
    if (userData.accessToken) {
      localStorage.setItem('access_token', userData.accessToken)
    }
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
    localStorage.removeItem('access_token')
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
