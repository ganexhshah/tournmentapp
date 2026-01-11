import React from 'react'
import { X, Mail, Calendar, Trophy, Coins, Shield, CheckCircle, XCircle, Users, GamepadIcon, Award, CreditCard, Package, Phone, MapPin, Clock } from 'lucide-react'
import { User } from '../../services/userService'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Section */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 mb-4">
                  {user.avatar ? (
                    <img 
                      className="h-24 w-24 rounded-full object-cover border-4 border-blue-100" 
                      src={user.avatar} 
                      alt={user.username} 
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center border-4 border-blue-100">
                      <span className="text-2xl font-medium text-white">
                        {user.firstName?.charAt(0) || user.username.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {user.phone}
                    </p>
                  )}
                  {user.gamerTag && (
                    <p className="text-sm text-blue-600 mt-1 font-medium">🎮 {user.gamerTag}</p>
                  )}
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Banned
                        </>
                      )}
                    </span>
                  </div>
                  {user.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Gaming Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <GamepadIcon className="h-4 w-4 mr-2" />
                Gaming Stats
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Level</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{user.level}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">XP</span>
                    </div>
                    <span className="text-sm text-gray-600">Experience</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{user.experience.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="h-6 w-6 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600">Coins</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{user.coins.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Activity Overview */}
            {user._count && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="text-sm font-medium text-gray-900 mb-4">Activity Overview</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user._count.teams}</div>
                    <div className="text-xs text-gray-500">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user._count.tournaments}</div>
                    <div className="text-xs text-gray-500">Tournaments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user._count.matches}</div>
                    <div className="text-xs text-gray-500">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{user._count.transactions}</div>
                    <div className="text-xs text-gray-500">Transactions</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="text-sm font-medium text-gray-900 mb-4">Account Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2 font-mono text-gray-900 text-xs">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Username:</span>
                  <span className="ml-2 text-gray-900">{user.username}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 text-gray-900">{formatDate(user.createdAt)}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-500">Last Login:</span>
                    <span className="ml-2 text-gray-900">{formatDate(user.lastLogin)}</span>
                  </div>
                )}
                {user.profile?.country && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-500">Country:</span>
                    <span className="ml-2 text-gray-900">{user.profile.country}</span>
                  </div>
                )}
                {user.profile?.timezone && (
                  <div>
                    <span className="text-gray-500">Timezone:</span>
                    <span className="ml-2 text-gray-900">{user.profile.timezone}</span>
                  </div>
                )}
              </div>
              {user.profile?.bio && (
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Bio:</span>
                  <p className="mt-1 text-gray-900 text-sm">{user.profile.bio}</p>
                </div>
              )}
            </div>

            {/* Teams */}
            {user.teams && user.teams.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Teams ({user.teams.length})
                </h5>
                <div className="space-y-3">
                  {user.teams.map((teamMember) => (
                    <div key={teamMember.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {teamMember.team.avatar ? (
                          <img className="h-8 w-8 rounded-full" src={teamMember.team.avatar} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {teamMember.team.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{teamMember.team.name}</div>
                          <div className="text-xs text-gray-500">
                            {teamMember.role} • Joined {formatDate(teamMember.joinedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Tournaments */}
            {user.tournaments && user.tournaments.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Recent Tournaments ({user.tournaments.length})
                </h5>
                <div className="space-y-3">
                  {user.tournaments.slice(0, 5).map((participation) => (
                    <div key={participation.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participation.tournament.title}</div>
                          <div className="text-xs text-gray-500">
                            🎮 {participation.tournament.game} • {participation.tournament.format}
                          </div>
                          <div className="text-xs text-gray-500">
                            💰 Entry: ${participation.tournament.entryFee} • Prize: ${participation.tournament.prizePool}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            participation.tournament.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            participation.tournament.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {participation.tournament.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Registered: {formatDate(participation.registeredAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Matches */}
            {user.matches && user.matches.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <GamepadIcon className="h-4 w-4 mr-2" />
                  Recent Matches ({user.matches.length})
                </h5>
                <div className="space-y-3">
                  {user.matches.slice(0, 5).map((participation) => (
                    <div key={participation.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participation.match.title}</div>
                          <div className="text-xs text-gray-500">
                            🎮 {participation.match.game}
                            {participation.match.round && ` • Round ${participation.match.round}`}
                          </div>
                          {participation.score !== null && (
                            <div className="text-xs text-blue-600 font-medium">
                              Score: {participation.score}
                              {participation.position && ` • Position: ${participation.position}`}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            participation.match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            participation.match.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {participation.match.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(participation.match.scheduledAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {user.transactions && user.transactions.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Recent Transactions ({user.transactions.length})
                </h5>
                <div className="space-y-3">
                  {user.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description || transaction.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}