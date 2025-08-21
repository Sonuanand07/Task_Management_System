import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { Loading } from '../components/ui/Loading';
import { UsersList } from '../components/users/UsersList';
import { useUsers } from '../contexts/UsersContext';
import { useAuth } from '../contexts/AuthContext';

export const UsersPage: React.FC = () => {
  const { users, isLoading, error, updateUser, deleteUser } = useUsers();
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UsersIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <UsersList
        users={users}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
        isLoading={isLoading}
      />
    </div>
  );
};