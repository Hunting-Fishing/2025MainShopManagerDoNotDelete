
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use fallback configuration if environment variables are not set
const url = supabaseUrl || 'https://oudkbrnvommbvtuispla.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback configuration.');
}

export const supabase = createClient(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
