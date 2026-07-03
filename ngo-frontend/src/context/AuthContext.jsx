import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch { }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password)

    const {
      access,
      refresh,
      user: userData,
    } = res.data.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(access)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { if (refresh) await authService.logout(refresh) } catch { }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const register = useCallback(async (data) => authService.register(data), [])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      role: user?.role || null,
      isNGO: user?.role === 'ngo',
      isVolunteer: user?.role === 'volunteer',
      isAdmin: user?.role === 'admin',
      login, logout, register,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
