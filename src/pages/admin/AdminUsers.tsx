import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import type { User } from '../../types';
import { Search, Filter, Eye, Shield, User as UserIcon, Mail, Calendar, Loader2, AlertCircle, X, Plus, Briefcase, Check, Archive, RotateCcw, Trash2 } from 'lucide-react';

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'customer'>('customer');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { success, error: toastError } = useToast();

  // Add user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'user'
  });

  const fetchUsers = async (append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const offset = append ? users.length : 0;
      const response = await userService.getAllUsers(10, offset);

      if (append) {
        setUsers(prev => [...prev, ...response.users]);
      } else {
        setUsers(response.users);
      }
      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search, role, and tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' ||
                         (roleFilter === 'admin' && user.is_admin) ||
                         (roleFilter === 'customer' && !user.is_admin);
    
    // Filter based on active tab
    if (activeTab === 'active') {
      return matchesSearch && matchesRole && user.status !== 'archived';
    }
    
    // Filter based on archived tab - show all users regardless of role
    if (activeTab === 'archived') {
      return matchesSearch && user.status === 'archived';
    }
    
    return false;
  });

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get display name with fallback
  const getDisplayName = (user: User) => {
    return user.full_name || user.email;
  };

  // Toggle admin status
  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      
      const result = await userService.toggleAdmin(userId, currentStatus);
      
      if (result.success) {
        // Update local state instantly
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, role: result.newStatus ? 'admin' : 'user' }
              : user
          )
        );
        
        success(
          'Role Updated', 
          `User is now ${result.newStatus ? 'an Admin' : 'a Customer'}`
        );
      }
    } catch (error: any) {
      console.error('Toggle admin error:', error);
      toastError('Update Failed', error.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  // Archive user
  const handleArchiveUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${userName}"? They can be restored later.`
    );
    
    if (!confirmed) return;
    
    try {
      setActionLoading(userId);
      
      await userService.archiveUser(userId);
      
      // Update local state instantly
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'archived' as const }
            : user
        )
      );
      
      success('User Archived', `${userName} has been archived and can be restored`);
    } catch (error: any) {
      console.error('Archive user error:', error);
      toastError('Archive Failed', error.message || 'Failed to archive user');
    } finally {
      setActionLoading(null);
    }
  };

  // Restore user
  const handleRestoreUser = async (userId: string, userName: string) => {
    try {
      setActionLoading(userId);
      
      await userService.restoreUser(userId);
      
      // Update local state instantly
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'active' as const }
            : user
        )
      );
      
      success('User Restored', `${userName} has been restored to active status`);
    } catch (error: any) {
      console.error('Restore user error:', error);
      toastError('Restore Failed', error.message || 'Failed to restore user');
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setActionLoading(userId);
      
      await userService.deleteUser(userId);
      
      // Update local state instantly
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      success('User Deleted', `${userName} has been permanently deleted`);
    } catch (error: any) {
      console.error('Delete user error:', error);
      toastError('Delete Failed', error.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check required fields
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toastError('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    // Additional validation: Ensure fields are not empty after trim
    if (newUser.email.trim() === '') {
      toastError('Validation Error', 'Email cannot be empty');
      return;
    }
    
    if (newUser.full_name.trim() === '') {
      toastError('Validation Error', 'Full name cannot be empty');
      return;
    }
    
    if (newUser.password.length < 6) {
      toastError('Validation Error', 'Password must be at least 6 characters long');
      return;
    }
    
    try {
      setActionLoading('add-user');
      
      // Payload with all required fields including password
      const userPayload = {
        email: newUser.email.trim(),
        password: newUser.password,
        full_name: newUser.full_name.trim(),
        is_admin: newUser.role === 'admin'
      };
      
      console.log('🔍 Creating user with auth:', userPayload);
      
      // Call service - creates auth user and profile
      const addedUser = await userService.addUser(userPayload);
      
      // Update UI state with the new user
      setUsers(prevUsers => [addedUser, ...prevUsers]);
      
      // Success feedback
      success('User Added', `${addedUser.full_name} has been created successfully and can login`);
      
      // Cleanup: Clear form and close modal
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      setShowAddModal(false);
      
    } catch (error: any) {
      console.error('Add user error:', error);
      
      // Handle specific errors
      if (error.message === 'A user with this email already exists') {
        toastError('Duplicate Email', 'A user with this email already exists in the system');
      } else if (error.message === 'Password must be at least 6 characters long') {
        toastError('Password Error', 'Password must be at least 6 characters long');
      } else if (error.message === 'Email is required') {
        toastError('Email Error', 'Email is required');
      } else if (error.message === 'Full name is required') {
        toastError('Name Error', 'Full name is required');
      } else {
        toastError('Add Failed', error.message || 'Failed to add user');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Handle form input changes
  const handleNewUserChange = (field: keyof typeof newUser, value: string | boolean) => {
    // Ensure role field stays valid
    if (field === 'role') {
      setNewUser(prev => ({ ...prev, [field]: value as 'admin' | 'user' }));
    } else {
      setNewUser(prev => ({ ...prev, [field]: value }));
    }
  };

  // Open role modal for user
  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.is_admin ? 'admin' : 'customer');
    setIsRoleModalOpen(true);
  };

  // Close role modal
  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    setSelectedRole('customer');
  };

  // Handle role selection
  const handleRoleSelection = (role: 'admin' | 'manager' | 'customer') => {
    if (role === 'manager') {
      console.log('Manager role coming soon');
      return;
    }
    setSelectedRole(role);
  };

  // Confirm role change
  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(`role-${selectedUser.id}`);
      
      const newAdminStatus = selectedRole === 'admin';
      const result = await userService.toggleAdmin(selectedUser.id, selectedUser.is_admin);
      
      if (result.success) {
        // Update local state instantly
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, role: newAdminStatus ? 'admin' : 'user' }
              : user
          )
        );
        
        success(
          'Role Updated', 
          `${getDisplayName(selectedUser)} is now ${selectedRole === 'admin' ? 'an Admin' : 'a Customer'}`
        );
        
        handleCloseRoleModal();
      }
    } catch (error: any) {
      console.error('Role change error:', error);
      toastError('Update Failed', error.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  // Get role display info
  const getRoleInfo = (role: 'admin' | 'manager' | 'customer') => {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin',
          icon: Shield,
          description: 'Full access to admin dashboard and all store management features',
          color: 'error'
        };
      case 'manager':
        return {
          title: 'Manager',
          icon: Briefcase,
          description: 'Limited management access to specific store features',
          color: 'warning'
        };
      case 'customer':
        return {
          title: 'Customer',
          icon: UserIcon,
          description: 'Standard store access for browsing and purchasing',
          color: 'secondary'
        };
    }
  };

  const getRoleBadge = (isAdmin: boolean, userId: string) => {
    const badgeClass = isAdmin 
      ? "flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" 
      : "flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity";
    
    if (isAdmin) {
      return (
        <Badge 
          variant="error" 
          className={badgeClass}
          onClick={() => handleToggleAdmin(userId, true)}
          title="Click to remove admin status"
        >
          <Shield className="w-3 h-3" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge 
        variant="secondary" 
        className={badgeClass}
        onClick={() => handleToggleAdmin(userId, false)}
        title="Click to make admin"
      >
        <UserIcon className="w-3 h-3" />
        Customer
      </Badge>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card variant="default" className="p-6 text-center max-w-md mx-auto mt-8">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active Users ({users.filter(u => u.status !== 'archived').length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Archived ({users.filter(u => u.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="default" className="!bg-white !border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="customer">Customers</option>
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">Export</Button>
        </div>
      </Card>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card variant="default" className="!bg-white !border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCount || users.length}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </Card>
        <Card variant="default" className="!bg-white !border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.is_admin).length}</p>
          <p className="text-sm text-gray-600">Admins</p>
        </Card>
        <Card variant="default" className="!bg-white !border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{users.filter(u => !u.is_admin).length}</p>
          <p className="text-sm text-gray-600">Customers</p>
        </Card>
        <Card variant="default" className="!bg-white !border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{filteredUsers.length}</p>
          <p className="text-sm text-gray-600">Filtered Results</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Email</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Registered</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getDisplayName(user)}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {actionLoading === user.id ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      getRoleBadge(user.is_admin, user.id)
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenRoleModal(user)}
                        disabled={actionLoading === `role-${user.id}`}
                      >
                        {actionLoading === `role-${user.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Edit Role'
                        )}
                      </Button>
                      
                      {/* Conditional buttons based on tab */}
                      {activeTab === 'active' ? (
                        !user.is_admin && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleArchiveUser(user.id, getDisplayName(user))}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Archive className="w-4 h-4" />
                                Archive
                              </>
                            )}
                          </Button>
                        )
                      ) : (
                        // Archived tab: Show Restore and Permanent Delete buttons
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleRestoreUser(user.id, getDisplayName(user))}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                Restore
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id, getDisplayName(user))}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No users found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : activeTab === 'active' 
                  ? 'No active users in the system' 
                  : 'No archived users'
              }
            </p>
          </div>
        )}
      </Card>
      {filteredUsers.length > 0 && hasMore && (
        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={() => fetchUsers(true)} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="!bg-white !border-gray-200 w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                disabled={actionLoading === 'add-user'}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => handleNewUserChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter full name"
                  disabled={actionLoading === 'add-user'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleNewUserChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email address"
                  disabled={actionLoading === 'add-user'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleNewUserChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter password (min. 6 characters)"
                  disabled={actionLoading === 'add-user'}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUser.role === 'admin'}
                    // Note: newUser.role is form state, user.is_admin is User type
                    onChange={(e) => handleNewUserChange('role', e.target.checked ? 'admin' : 'user')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={actionLoading === 'add-user'}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Admin Privileges
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Admin users can access the admin dashboard and manage all aspects of the store.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading === 'add-user'}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading === 'add-user'}
                  className="flex-1"
                >
                  {actionLoading === 'add-user' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Role Edit Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-lg m-4">
            <Card variant="elevated" className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Change User Role</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update role for {getDisplayName(selectedUser)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseRoleModal}
                  disabled={actionLoading === `role-${selectedUser.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getDisplayName(selectedUser)}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <div className="mt-1">
                      {getRoleBadge(selectedUser.is_admin, selectedUser.id)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3 mb-6">
                {(['admin', 'manager', 'customer'] as const).map((role) => {
                  const roleInfo = getRoleInfo(role);
                  const Icon = roleInfo.icon;
                  const isSelected = selectedRole === role;
                  const isDisabled = role === 'manager';
                  const isCurrentRole = 
                    (role === 'admin' && selectedUser.is_admin) || 
                    (role === 'customer' && !selectedUser.is_admin);

                  return (
                    <div
                      key={role}
                      onClick={() => !isDisabled && handleRoleSelection(role)}
                      className={`
                        relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${isDisabled 
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                          : isSelected 
                            ? 'border-primary-500 bg-primary-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${isSelected 
                            ? 'bg-primary-500 text-white' 
                            : isDisabled
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                              {roleInfo.title}
                            </h3>
                            {isCurrentRole && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                            {isSelected && !isCurrentRole && (
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {roleInfo.description}
                          </p>
                          {isDisabled && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Coming soon - this role is not yet available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseRoleModal}
                  disabled={actionLoading === `role-${selectedUser.id}`}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmRoleChange}
                  disabled={actionLoading === `role-${selectedUser.id}` || selectedRole === 'manager'}
                  className="flex-1"
                >
                  {actionLoading === `role-${selectedUser.id}` ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Confirm Change'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
