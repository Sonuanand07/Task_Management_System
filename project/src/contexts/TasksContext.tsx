import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TasksState, TaskFilters, CreateTaskData, UpdateTaskData } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface TasksContextType extends TasksState {
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskData, files?: File[]) => Promise<void>;
  updateTask: (data: UpdateTaskData, files?: File[]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
}

type TasksAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; totalCount: number } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number };

const initialFilters: TaskFilters = {
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
  totalCount: 0,
  currentPage: 1,
};

const tasksReducer = (state: TasksState, action: TasksAction): TasksState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        totalCount: action.payload.totalCount,
        isLoading: false,
        error: null,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        totalCount: state.totalCount + 1,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        totalCount: state.totalCount - 1,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        currentPage: action.payload.page || 1,
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialFilters,
        currentPage: 1,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        filters: { ...state.filters, page: action.payload },
      };
    default:
      return state;
  }
};

const TasksContext = createContext<TasksContextType | null>(null);

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const { user } = useAuth();

  const fetchTasks = async (filters: TaskFilters = state.filters) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_to_fkey(id, email, role),
          documents:task_documents(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // For regular users, only show their tasks or tasks assigned to them
      if (user.role !== 'admin') {
        query = query.or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`);
      }

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      }

      // Apply pagination
      const from = ((filters.page || 1) - 1) * (filters.limit || 10);
      const to = from + (filters.limit || 10) - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      dispatch({
        type: 'SET_TASKS',
        payload: {
          tasks: data || [],
          totalCount: count || 0,
        },
      });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch tasks');
    }
  };

  const uploadTaskDocuments = async (taskId: string, files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('task_documents')
        .insert({
          task_id: taskId,
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  const createTask = async (data: CreateTaskData, files?: File[]) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          ...data,
          created_by: user.id,
        })
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_to_fkey(id, email, role),
          documents:task_documents(*)
        `)
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        await uploadTaskDocuments(newTask.id, files);
        
        // Refetch the task with documents
        const { data: updatedTask } = await supabase
          .from('tasks')
          .select(`
            *,
            assigned_user:profiles!tasks_assigned_to_fkey(id, email, role),
            documents:task_documents(*)
          `)
          .eq('id', newTask.id)
          .single();

        if (updatedTask) {
          dispatch({ type: 'ADD_TASK', payload: updatedTask });
        }
      } else {
        dispatch({ type: 'ADD_TASK', payload: newTask });
      }

      toast.success('Task created successfully!');
    } catch (error: any) {
      console.error('Error creating task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to create task');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (data: UpdateTaskData, files?: File[]) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { id, ...updateData } = data;
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_to_fkey(id, email, role),
          documents:task_documents(*)
        `)
        .single();

      if (error) throw error;

      if (files && files.length > 0) {
        await uploadTaskDocuments(id, files);
        
        // Refetch the task with documents
        const { data: refetchedTask } = await supabase
          .from('tasks')
          .select(`
            *,
            assigned_user:profiles!tasks_assigned_to_fkey(id, email, role),
            documents:task_documents(*)
          `)
          .eq('id', id)
          .single();

        if (refetchedTask) {
          dispatch({ type: 'UPDATE_TASK', payload: refetchedTask });
        }
      } else {
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }

      toast.success('Task updated successfully!');
    } catch (error: any) {
      console.error('Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update task');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Delete associated documents first
      const { data: documents } = await supabase
        .from('task_documents')
        .select('file_path')
        .eq('task_id', taskId);

      if (documents && documents.length > 0) {
        // Delete files from storage
        const filePaths = documents.map(doc => doc.file_path);
        await supabase.storage
          .from('task-documents')
          .remove(filePaths);

        // Delete document records
        await supabase
          .from('task_documents')
          .delete()
          .eq('task_id', taskId);
      }

      // Delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      dispatch({ type: 'DELETE_TASK', payload: taskId });
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete task');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setFilters = (filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Auto-fetch tasks when filters change
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, state.filters]);

  return (
    <TasksContext.Provider
      value={{
        ...state,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        setFilters,
        clearFilters,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};