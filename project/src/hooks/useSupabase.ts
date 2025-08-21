import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
          setIsConnected(false);
          if (error.message.includes('relation "public.profiles" does not exist')) {
            toast.error('Database tables not set up. Please run migrations.');
          } else {
            toast.error('Failed to connect to database');
          }
        } else {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
        toast.error('Database connection failed');
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isChecking };
};