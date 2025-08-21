import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UsersState } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface UsersContextType extends UsersState {
  fetchUsers: () => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

type UsersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

const usersReducer = (state: UsersState, action: UsersAction): UsersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload, isLoading: false, error: null };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

const UsersContext = createContext<UsersContextType | null>(null);

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, initialState);
  const { user } = useAuth();

  const fetchUsers = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_USERS', payload: data || [] });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch users');
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized to update users');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      toast.success('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update user');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized to delete users');
      return;
    }

    if (userId === user.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // First, reassign tasks from this user to the current admin
      await supabase
        .from('tasks')
        .update({ assigned_to: user.id })
        .eq('assigned_to', userId);

      await supabase
        .from('tasks')
        .update({ created_by: user.id })
        .eq('created_by', userId);

      // Delete the user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      dispatch({ type: 'DELETE_USER', payload: userId });
      toast.success('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete user');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return (
    <UsersContext.Provider
      value={{
        ...state,
        fetchUsers,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};