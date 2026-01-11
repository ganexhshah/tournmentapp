import api from './api'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalTournaments: number
  activeTournaments: number
  totalTeams: number
  activeTeams: number
  totalMatches: number
  liveMatches: number
  todayMatches: number
}

export interface RecentActivity {
  id: string
  type: 'USER_REGISTERED' | 'TOURNAMENT_CREATED' | 'TEAM_CREATED' | 'MATCH_COMPLETED'
  message: string
  user?: {
    id: string
    username: string
  }
  createdAt: string
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    // Since there's no specific dashboard endpoint, we'll make multiple calls
    const [usersRes, tournamentsRes, teamsRes, matchesRes] = await Promise.all([
      api.get('/users?limit=1'),
      api.get('/tournaments?limit=1'),
      api.get('/teams?limit=1'),
      api.get('/matches?limit=1')
    ])

    // Get active tournaments (IN_PROGRESS status)
    const activeTournamentsRes = await api.get('/tournaments?status=IN_PROGRESS&limit=1')
    
    // Get live matches (IN_PROGRESS status)
    const liveMatchesRes = await api.get('/matches?status=IN_PROGRESS&limit=1')
    
    // Get today's matches
    const today = new Date().toISOString().split('T')[0]
    const todayMatchesRes = await api.get(`/matches?scheduledAt=${today}&limit=1`)

    const stats: DashboardStats = {
      totalUsers: usersRes.data.pagination.total,
      activeUsers: usersRes.data.pagination.total, // Assuming all users are active for now
      totalTournaments: tournamentsRes.data.pagination.total,
      activeTournaments: activeTournamentsRes.data.pagination.total,
      totalTeams: teamsRes.data.pagination.total,
      activeTeams: teamsRes.data.pagination.total, // Assuming all teams are active for now
      totalMatches: matchesRes.data.pagination.total,
      liveMatches: liveMatchesRes.data.pagination.total,
      todayMatches: todayMatchesRes.data.pagination.total
    }

    // Mock recent activity for now
    const recentActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'USER_REGISTERED',
        message: 'New user registered',
        user: { id: '1', username: 'newuser' },
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'TOURNAMENT_CREATED',
        message: 'New tournament created',
        user: { id: '2', username: 'admin' },
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'TEAM_CREATED',
        message: 'New team formed',
        user: { id: '3', username: 'captain' },
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ]

    return { stats, recentActivity }
  }
}