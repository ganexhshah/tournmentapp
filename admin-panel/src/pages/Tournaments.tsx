import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Calendar, Users } from 'lucide-react'

const mockTournaments = [
  { 
    id: 1, 
    name: 'Winter Championship 2024', 
    game: 'PUBG Mobile', 
    status: 'Active', 
    participants: 64, 
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    prize: '$5,000'
  },
  { 
    id: 2, 
    name: 'Spring League', 
    game: 'Free Fire', 
    status: 'Upcoming', 
    participants: 32, 
    startDate: '2024-03-01',
    endDate: '2024-03-20',
    prize: '$3,000'
  },
  { 
    id: 3, 
    name: 'Pro Series', 
    game: 'Call of Duty', 
    status: 'Completed', 
    participants: 128, 
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    prize: '$10,000'
  },
]

export default function Tournaments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tournaments] = useState(mockTournaments)

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all tournaments and competitions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
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
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {tournament.name}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Game:</span>
                  <span className="ml-2">{tournament.game}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{tournament.participants} participants</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{tournament.startDate} - {tournament.endDate}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Prize Pool:</span>
                  <span className="ml-2 text-green-600 font-semibold">{tournament.prize}</span>
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