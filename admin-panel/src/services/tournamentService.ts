import api from './api'

export interface Tournament {
  id: string
  name: string
  description?: string
  game: string
  type: string
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  maxParticipants: number
  currentParticipants: number
  prizePool: number
  entryFee: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    username: string
  }
}

export interface TournamentsResponse {
  tournaments: Tournament[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface TournamentFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  game?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const tournamentService = {
  async getTournaments(filters: TournamentFilters = {}): Promise<TournamentsResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.game) params.append('game', filters.game)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get(`/tournaments?${params.toString()}`)
    return response.data
  },

  async getTournamentById(id: string): Promise<{ tournament: Tournament }> {
    const response = await api.get(`/tournaments/${id}`)
    return response.data
  },

  async createTournament(data: Partial<Tournament>): Promise<{ message: string; tournament: Tournament }> {
    const response = await api.post('/tournaments', data)
    return response.data
  },

  async updateTournament(id: string, data: Partial<Tournament>): Promise<{ message: string; tournament: Tournament }> {
    const response = await api.put(`/tournaments/${id}`, data)
    return response.data
  },

  async deleteTournament(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tournaments/${id}`)
    return response.data
  },

  async startTournament(id: string): Promise<{ message: string }> {
    const response = await api.post(`/tournaments/${id}/start`)
    return response.data
  },

  async cancelTournament(id: string): Promise<{ message: string }> {
    const response = await api.post(`/tournaments/${id}/cancel`)
    return response.data
  }
}