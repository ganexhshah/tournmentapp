import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Calendar, Clock, Trophy } from 'lucide-react'

const mockMatches = [
  { 
    id: 1, 
    tournament: 'Winter Championship 2024',
    team1: 'Thunder Warriors',
    team2: 'Fire Dragons',
    status: 'Live',
    score: '2-1',
    startTime: '2024-02-01 15:00',
    game: 'PUBG Mobile'
  },
  { 
    id: 2, 
    tournament: 'Spring League',
    team1: 'Ice Phoenixes',
    team2: 'Storm Eagles',
    status: 'Scheduled',
    score: '-',
    startTime: '2024-02-02 18:00',
    game: 'Free Fire'
  },
  { 
    id: 3, 
    tournament: 'Pro Series',
    team1: 'Thunder Warriors',
    team2: 'Storm Eagles',
    status: 'Completed',
    score: '3-2',
    startTime: '2024-01-31 20:00',
    game: 'Call of Duty'
  },
  { 
    id: 4, 
    tournament: 'Winter Championship 2024',
    team1: 'Fire Dragons',
    team2: 'Ice Phoenixes',
    status: 'Completed',
    score: '1-3',
    startTime: '2024-01-30 16:00',
    game: 'PUBG Mobile'
  },
]

export default function Matches() {
  const [searchTerm, setSearchTerm] = useState('')
  const [matches] = useState(mockMatches)

  const filteredMatches = matches.filter(match =>
    match.tournament.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team2.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-red-100 text-red-800'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all matches and their results
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Match
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
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{match.tournament}</div>
                      <div className="text-sm text-gray-500">{match.game}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{match.team1}</span>
                        <span className="text-gray-400">vs</span>
                        <span>{match.team2}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {match.status === 'Live' && (
                        <div className="flex items-center mr-2">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{match.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {match.startTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}