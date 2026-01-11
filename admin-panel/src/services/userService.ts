import api from './api'

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  gamerTag?: string
  level: number
  experience: number
  coins: number
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt?: string
  lastLogin?: string
  profile?: {
    bio?: string
    country?: string
    timezone?: string
    dateOfBirth?: string
    preferences?: any
  }
  _count?: {
    teams: number
    tournaments: number
    matches: number
    transactions: number
    notifications?: number
    rewards?: number
    orders?: number
  }
  teams?: Array<{
    id: string
    role: string
    joinedAt: string
    team: {
      id: string
      name: string
      description?: string
      avatar?: string
      maxMembers?: number
      _count?: {
        members: number
      }
    }
  }>
  tournaments?: Array<{
    id: string
    registeredAt: string
    tournament: {
      id: string
      title: string
      description?: string
      game: string
      format: string
      status: string
      maxParticipants: number
      entryFee: number
      prizePool: number
      startDate: string
      endDate?: string
    }
  }>
  matches?: Array<{
    id: string
    score?: number
    position?: number
    match: {
      id: string
      title: string
      game: string
      status: string
      round?: number
      scheduledAt: string
      startedAt?: string
      endedAt?: string
      result?: any
    }
  }>
  transactions?: Array<{
    id: string
    type: string
    amount: number
    description?: string
    status: string
    createdAt: string
  }>
  rewards?: Array<{
    id: string
    claimed: boolean
    claimedAt?: string
    createdAt: string
    reward: {
      id: string
      title: string
      description?: string
      type: string
      value: number
    }
  }>
  orders?: Array<{
    id: string
    items: any
    totalAmount: number
    status: string
    createdAt: string
  }>
}

export interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const userService = {
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get(`/users?${params.toString()}`)
    return response.data
  },

  async createUser(userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    gamerTag?: string
    role?: string
  }): Promise<{ message: string; user: User }> {
    const response = await api.post('/users', userData)
    return response.data
  },

  async getUserById(id: string): Promise<{ user: User }> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  async banUser(id: string, reason?: string): Promise<{ message: string }> {
    const response = await api.post(`/users/${id}/ban`, { reason })
    return response.data
  },

  async unbanUser(id: string): Promise<{ message: string }> {
    const response = await api.post(`/users/${id}/unban`)
    return response.data
  }
}