import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, User } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Only allow admin and moderator roles
        if (parsedUser.role === 'ADMIN' || parsedUser.role === 'MODERATOR') {
          setUser(parsedUser)
          setIsAuthenticated(true)
        } else {
          // Clear invalid user data
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password })
      
      // Only allow admin and moderator roles
      if (response.user.role !== 'ADMIN' && response.user.role !== 'MODERATOR') {
        throw new Error('Access denied. Admin or Moderator role required.')
      }
      
      setUser(response.user)
      setIsAuthenticated(true)
      localStorage.setItem('admin_token', response.accessToken)
      localStorage.setItem('admin_refresh_token', response.refreshToken)
      localStorage.setItem('admin_user', JSON.stringify(response.user))
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
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