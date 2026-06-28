import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

export interface User {
  id: string
  email: string
  name: string
  role: string
  salonId?: string
}

interface StaffInfo {
  id: string
  userId: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  staff: StaffInfo | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staff, setStaff] = useState<StaffInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('sa_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      refreshAccessToken()
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      refreshAccessToken()
    }, 14 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  const refreshAccessToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh')
      localStorage.setItem('sa_token', data.accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
    } catch {
      logout()
    }
  }

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff/me')
      setStaff(data)
    } catch {
      // User may not have a staff record
    }
  }

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sa_token', data.accessToken)
    localStorage.setItem('sa_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
    setUser(data.user)
    fetchStaff()
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setStaff(null)
  }

  return (
    <AuthContext.Provider value={{ user, staff, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
