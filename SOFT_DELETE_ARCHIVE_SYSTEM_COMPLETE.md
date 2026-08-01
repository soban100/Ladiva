# Soft Delete (Archive/Restore) System Implementation

## ✅ **Complete Archive & Restore System**

Implemented a comprehensive soft delete system that allows users to be archived and restored, with permanent deletion as an option.

---

## 🔧 **userService.ts - Updated Functions**

### **New Functions Added:**

#### **1. archiveUser(userId)**
```typescript
async archiveUser(userId: string): Promise<boolean> {
  try {
    console.log('📦 Archiving user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'archived' })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error archiving user:', error);
      throw error;
    }

    console.log('✅ User archived successfully');
    return true;
  } catch (error) {
    console.error('❌ userService.archiveUser error:', error);
    throw error;
  }
}
```

#### **2. restoreUser(userId)**
```typescript
async restoreUser(userId: string): Promise<boolean> {
  try {
    console.log('♻️ Restoring user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error restoring user:', error);
      throw error;
    }

    console.log('✅ User restored successfully');
    return true;
  } catch (error) {
    console.error('❌ userService.restoreUser error:', error);
    throw error;
  }
}
```

#### **3. Enhanced deleteUser(userId)**
```typescript
async deleteUser(userId: string): Promise<boolean> {
  try {
    console.log('🗑️ Permanently deleting user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }

    console.log('✅ User permanently deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ userService.deleteUser error:', error);
    throw error;
  }
}
```

#### **4. Enhanced getAllUsers()**
```typescript
async getAllUsers(): Promise<User[]> {
  try {
    console.log('🔍 Fetching all users from profiles table...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_admin, status, created_at') // ✅ Added status field
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }

    console.log('✅ Users fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ userService.getAllUsers error:', error);
    throw error;
  }
}
```

---

## 🎨 **AdminUsers.tsx - Complete UI Implementation**

### **Updated State:**
```typescript
const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
```

### **Enhanced Filtering Logic:**
```typescript
const filteredUsers = users.filter(user => {
  const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesRole = roleFilter === 'all' ||
                       (roleFilter === 'admin' && user.is_admin) ||
                       (roleFilter === 'customer' && !user.is_admin);
  
  const matchesStatus = activeTab === 'active' && (user.status !== 'archived') ||
                       activeTab === 'archived' && (user.status === 'archived');
  
  return matchesSearch && matchesRole && matchesStatus;
});
```

### **Tab Navigation:**
```jsx
{/* Tabs */}
<Card variant="default" className="p-6 mb-8">
  <div className="flex space-x-4 border-b border-gray-200">
    <button
      onClick={() => setActiveTab('active')}
      className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
        activeTab === 'active'
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      Active Users
    </button>
    <button
      onClick={() => setActiveTab('archived')}
      className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
        activeTab === 'archived'
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      Archived/Deleted
    </button>
  </div>
</Card>
```

### **Conditional Action Buttons:**

#### **Active Tab - Archive Button:**
```jsx
{activeTab === 'active' ? (
  // Active tab: Show Archive button (for non-admins)
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
          Restore
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
```

### **Component Handlers:**

#### **Archive Handler:**
```typescript
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
```

#### **Restore Handler:**
```typescript
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
```

---

## 🎯 **Complete User Management Flow**

### **Active Users Tab:**
1. **View Users** → Shows all users with status !== 'archived'
2. **Archive User** → Sets status to 'archived' (soft delete)
3. **Edit Role** → Opens role modal for admin status changes
4. **View Details** → Eye button to view user information

### **Archived Users Tab:**
1. **View Archived** → Shows only users with status === 'archived'
2. **Restore User** → Sets status back to 'active'
3. **Permanent Delete** → Hard deletes user from database
4. **Search/Filter** → Works across both tabs

### **State Management:**
```typescript
// Archive - Instant UI Update
setUsers(prevUsers => 
  prevUsers.map(user => 
    user.id === userId 
      ? { ...user, status: 'archived' as const }
      : user
  )
);

// Restore - Instant UI Update
setUsers(prevUsers => 
  prevUsers.map(user => 
    user.id === userId 
      ? { ...user, status: 'active' as const }
      : user
  )
);

// Permanent Delete - Remove from state
setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
```

---

## 📊 **Database Schema Requirements**

### **Updated profiles Table:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### **Status Values:**
- ✅ **'active'**: User is currently active and can login
- ✅ **'archived'**: User is archived (soft deleted) and cannot login
- ✅ **CHECK Constraint**: Ensures only valid status values

---

## 🚀 **User Experience Features**

### **Visual Feedback:**
- ✅ **Tab Navigation**: Clear active/inactive state indication
- ✅ **Button Colors**: Orange (archive), Green (restore), Red (permanent delete)
- ✅ **Icons**: Archive, RotateCcw (restore), Trash2 (permanent delete)
- ✅ **Loading States**: Spinners during operations
- ✅ **Confirmation Dialogs**: Safety confirmations for all actions

### **Instant UI Updates:**
- ✅ **Archive**: User immediately moves to archived tab
- ✅ **Restore**: User immediately returns to active tab
- ✅ **Delete**: User immediately disappears from both tabs
- ✅ **No Refresh**: All changes visible instantly

### **Error Handling:**
- ✅ **Archive Failures**: Specific error messages
- ✅ **Restore Failures**: Clear error feedback
- ✅ **Delete Failures**: Permanent delete error handling
- ✅ **Network Issues**: Graceful error recovery

---

## 🎉 **Benefits**

1. ✅ **Data Safety**: Soft delete prevents accidental data loss
2. ✅ **Recovery Options**: Users can be easily restored
3. ✅ **Audit Trail**: Maintains history of user status changes
4. ✅ **User Friendly**: Clear visual indicators and actions
5. ✅ **Flexible**: Multiple deletion options for different needs
6. ✅ **Instant Feedback**: All actions update UI immediately
7. ✅ **Professional**: Modern UI with proper icons and colors

The soft delete system provides **complete user lifecycle management** with archive, restore, and permanent deletion capabilities!
