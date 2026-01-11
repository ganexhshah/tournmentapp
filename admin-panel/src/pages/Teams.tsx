import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Users, Trophy } from 'lucide-react'

const mockTeams = [
  { 
    id: 1, 
    name: 'Thunder Warriors', 
    captain: 'John Doe', 
    members: 5, 
    wins: 12, 
    losses: 3, 
    status: 'Active',
    createdDate: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'Fire Dragons', 
    captain: 'Jane Smith', 
    members: 4, 
    wins: 8, 
    losses: 2, 
    status: 'Active',
    createdDate: '2024-01-10'
  },
  { 
    id: 3, 
    name: 'Ice Phoenixes', 
    captain: 'Mike Johnson', 
    members: 3, 
    wins: 5, 
    losses: 7, 
    status: 'Inactive',
    createdDate: '2024-01-05'
  },
  { 
    id: 4, 
    name: 'Storm Eagles', 
    captain: 'Sarah Wilson', 
    members: 5, 
    wins: 15, 
    losses: 1, 
    status: 'Active',
    createdDate: '2024-01-20'
  },
]

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('')
  const [teams] = useState(mockTeams)

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.captain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    return total > 0 ? Math.round((wins / total) * 100) : 0
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all teams and their performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {team.name}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Captain:</span>
                  <span className="ml-2">{team.captain}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{team.members} members</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>W: {team.wins} / L: {team.losses}</span>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    {getWinRate(team.wins, team.losses)}% WR
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{team.createdDate}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-900 font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}