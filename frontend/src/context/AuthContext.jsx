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
    AuthAPI.me()
      .then(res => { if (mounted) setUser(res.user || null) })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  async function login(username, password) {
    const res = await AuthAPI.login(username, password)
    setUser(res.user)
    return res.user
  }
  async function logout() {
    await AuthAPI.logout()
    setUser(null)
  }
  async function refresh() {
    await AuthAPI.refresh()
    const me = await AuthAPI.me()
    setUser(me.user || null)
  }

  const value = useMemo(() => ({
    user, loading, login, logout, refresh
  }), [user, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)   // ถ้าได้ null แปลว่าไม่ได้ห่อด้วย AuthProvider
}
