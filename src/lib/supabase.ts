
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback configuration.');
  // Use the actual Supabase project values from the integration
  const fallbackUrl = 'https://oudkbrnvommbvtuispla.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4';
  
  export const supabase = createClient(fallbackUrl, fallbackKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}
