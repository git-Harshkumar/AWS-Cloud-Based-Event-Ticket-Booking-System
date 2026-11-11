import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      const user = response.data?.data?.user || response.data?.user
      if (user) {
        setUser(user)
      } else {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const payload = response.data?.data || response.data
    const { token, user } = payload
    localStorage.setItem('token', token)
    setUser(user)
    return payload
  }

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData)
    const payload = response.data?.data || response.data
    const { token, user } = payload
    localStorage.setItem('token', token)
    setUser(user)
    return payload
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}