import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'user';
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
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
        };
        Insert: {
          title: string;
          description: string;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          due_date: string;
          assigned_to: string;
          created_by: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string;
          assigned_to?: string;
          updated_at?: string;
        };
      };
      task_documents: {
        Row: {
          id: string;
          task_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          uploaded_at: string;
        };
        Insert: {
          task_id: string;
          filename: string;
          file_path: string;
          file_size: number;
        };
      };
    };
  };
}