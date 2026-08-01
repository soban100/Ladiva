// Fix the entire table body section with proper JSX structure
// Replace the entire <tbody> section in AdminUsers.tsx with this corrected code:

<tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getDisplayName(user)}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {actionLoading === user.id ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      </div>
                    ) : (
                      getRoleBadge(user.is_admin, user.id)
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
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
                            className="text-orange-600 hover:text-orange-700"
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
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleRestoreUser(user.id, getDisplayName(user))}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                Restore to Active
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id, getDisplayName(user))}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Permanent Delete
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
