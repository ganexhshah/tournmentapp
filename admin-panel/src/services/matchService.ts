import api from './api'

export interface Match {
  id: string
  tournamentId?: string
  team1Id: string
  team2Id: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  team1Score: number
  team2Score: number
  winnerId?: string
  createdAt: string
  updatedAt: string
  tournament?: {
    id: string
    name: string
    game: string
  }
  team1: {
    id: string
    name: string
  }
  team2: {
    id: string
    name: string
  }
  winner?: {
    id: string
    name: string
  }
}

export interface MatchesResponse {
  matches: Match[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface MatchFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  tournamentId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const matchService = {
  async getMatches(filters: MatchFilters = {}): Promise<MatchesResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.tournamentId) params.append('tournamentId', filters.tournamentId)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get(`/matches?${params.toString()}`)
    return response.data
  },

  async getMatchById(id: string): Promise<{ match: Match }> {
    const response = await api.get(`/matches/${id}`)
    return response.data
  },

  async createMatch(data: Partial<Match>): Promise<{ message: string; match: Match }> {
    const response = await api.post('/matches', data)
    return response.data
  },

  async updateMatch(id: string, data: Partial<Match>): Promise<{ message: string; match: Match }> {
    const response = await api.put(`/matches/${id}`, data)
    return response.data
  },

  async deleteMatch(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/matches/${id}`)
    return response.data
  },

  async startMatch(id: string): Promise<{ message: string }> {
    const response = await api.post(`/matches/${id}/start`)
    return response.data
  },

  async submitResult(id: string, result: { team1Score: number; team2Score: number; winnerId: string }): Promise<{ message: string }> {
    const response = await api.post(`/matches/${id}/result`, result)
    return response.data
  }
}