// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { AuthAPI } from '../services/auth'   // ← path ของคุณ

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // โหลดสถานะจากเซิร์ฟเวอร์ตอนเริ่ม
  useEffect(() => {
    let mounted = true
    
    // ตรวจสอบ localStorage ก่อน
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
    
    // ถ้าไม่มี localStorage ให้ใช้ Mock user สำหรับ demo
    if (mounted) {
      setUser({
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@kvc.local',
        role: 'student'
      })
      setLoading(false)
    }
    return () => { mounted = false }
  }, [])

  async function login(username, password) {
    const user = { id: 'user-' + Date.now(), name: username, email: username + '@kvc.local', role: 'student' }
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }
  async function logout() {
    localStorage.removeItem('user')
    setUser(null)
  }
  async function refresh() {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }

  const value = useMemo(() => ({
    user, loading, login, logout, refresh
  }), [user, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)   // ถ้าได้ null แปลว่าไม่ได้ห่อด้วย AuthProvider
}
