import api from './api'

export interface Team {
  id: string
  name: string
  description?: string
  logo?: string
  isActive: boolean
  maxMembers: number
  currentMembers: number
  wins: number
  losses: number
  createdAt: string
  updatedAt: string
  captain: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
}

export interface TeamsResponse {
  teams: Team[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface TeamFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const teamService = {
  async getTeams(filters: TeamFilters = {}): Promise<TeamsResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get(`/teams?${params.toString()}`)
    return response.data
  },

  async getTeamById(id: string): Promise<{ team: Team }> {
    const response = await api.get(`/teams/${id}`)
    return response.data
  },

  async createTeam(data: Partial<Team>): Promise<{ message: string; team: Team }> {
    const response = await api.post('/teams', data)
    return response.data
  },

  async updateTeam(id: string, data: Partial<Team>): Promise<{ message: string; team: Team }> {
    const response = await api.put(`/teams/${id}`, data)
    return response.data
  },

  async deleteTeam(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/teams/${id}`)
    return response.data
  }
}