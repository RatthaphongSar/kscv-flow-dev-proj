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
    
    // ถ้าไม่มี localStorage ให้โหลดจาก /auth/me (ถ้า user ยังอยู่ใน cookie session)
    AuthAPI.me()
      .then(u => {
        if (mounted && u) {
          setUser(u)
          localStorage.setItem('user', JSON.stringify(u))
        }
      })
      .catch(() => {
        // ไม่มี session ให้ปล่อยเป็น null (ต้อง login)
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => { mounted = false }
  }, [])

  async function login(username, password) {
    // เรียก API จริง
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

  const value = useMemo(() => ({
    user, loading, login, logout, refresh
  }), [user, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)   // ถ้าได้ null แปลว่าไม่ได้ห่อด้วย AuthProvider
}
