import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  isVerified: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  }
}