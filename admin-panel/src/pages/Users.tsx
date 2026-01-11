import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Ban, UserCheck } from 'lucide-react'
import { userService, User, UserFilters } from '../services/userService'
import AddUserModal from '../components/users/AddUserModal'
import EditUserModal from '../components/users/EditUserModal'
import ViewUserModal from '../components/users/ViewUserModal'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [searchTerm, pagination.page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const filters: UserFilters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
      
      const response = await userService.getUsers(filters)
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return
    
    try {
      await userService.banUser(userId, 'Banned by admin')
      loadUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await userService.unbanUser(userId)
      loadUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('Failed to unban user')
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    const deleteType = confirm(
      `Choose deletion type for user "${username}":\n\n` +
      `Click OK for SOFT DELETE (deactivate user - can be restored)\n` +
      `Click Cancel to choose PERMANENT DELETE (cannot be undone)`
    );

    let permanent = false;
    
    if (!deleteType) {
      // User clicked Cancel, ask for permanent delete confirmation
      permanent = confirm(
        `⚠️ PERMANENT DELETE WARNING ⚠️\n\n` +
        `This will PERMANENTLY delete user "${username}" and ALL their data including:\n` +
        `• Profile information\n` +
        `• Tournament history\n` +
        `• Match records\n` +
        `• Transactions\n` +
        `• Teams and memberships\n\n` +
        `This action CANNOT be undone!\n\n` +
        `Are you absolutely sure you want to permanently delete this user?`
      );
      
      if (!permanent) return; // User cancelled permanent delete
    }
    
    try {
      await userService.deleteUser(userId, permanent);
      
      loadUsers();
      alert(permanent 
        ? 'User permanently deleted successfully!' 
        : 'User deactivated successfully!'
      );
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  }

  const handleAddUser = async (userData: any) => {
    try {
      setModalLoading(true)
      await userService.createUser(userData)
      setShowAddModal(false)
      loadUsers()
      alert('User created successfully!')
    } catch (error: any) {
      console.error('Error creating user:', error)
      alert(error.response?.data?.message || 'Failed to create user')
    } finally {
      setModalLoading(false)
    }
  }

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return
    
    try {
      setModalLoading(true)
      await userService.updateUser(selectedUser.id, userData)
      setShowEditModal(false)
      setSelectedUser(null)
      loadUsers()
      alert('User updated successfully!')
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.response?.data?.message || 'Failed to update user')
    } finally {
      setModalLoading(false)
    }
  }

  const handleViewUser = async (user: User) => {
    try {
      // Get full user details
      const response = await userService.getUserById(user.id)
      setSelectedUser(response.user)
      setShowViewModal(true)
    } catch (error) {
      console.error('Error fetching user details:', error)
      alert('Failed to load user details')
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all users in your platform ({pagination.total} total)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gaming Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {user.avatar ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName?.charAt(0) || user.username.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                        {user.gamerTag && (
                          <div className="text-xs text-blue-600 font-medium">🎮 {user.gamerTag}</div>
                        )}
                        <div className="flex items-center space-x-1 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                    {user.profile?.country && (
                      <div className="text-xs text-gray-500">📍 {user.profile.country}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Lvl {user.level}</span>
                        <span className="text-yellow-600">💰 {user.coins.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.experience.toLocaleString()} XP
                      </div>
                      {user._count && (
                        <div className="text-xs text-gray-500 mt-1">
                          🏆 {user._count.tournaments} tournaments • 🎯 {user._count.matches} matches
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user._count && (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">👥 {user._count.teams}</span>
                          <span className="text-green-600">💳 {user._count.transactions}</span>
                        </div>
                        {user._count.orders && user._count.orders > 0 && (
                          <div className="text-xs text-gray-500">📦 {user._count.orders} orders</div>
                        )}
                        {user.lastLogin && (
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                      {user.isVerified && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.isActive ? (
                        <button 
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Ban User"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnbanUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Unban User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <div className="relative group">
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        loading={modalLoading}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleEditUser}
        user={selectedUser}
        loading={modalLoading}
      />

      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />
    </div>
  )
}