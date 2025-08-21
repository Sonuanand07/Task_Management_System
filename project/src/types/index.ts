export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  documents?: TaskDocument[];
  assigned_user?: User;
}

export interface TaskDocument {
  id: string;
  task_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  due_date: string;
  assigned_to: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
  search?: string;
  sortBy?: 'due_date' | 'created_at' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  totalCount: number;
  currentPage: number;
}

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}