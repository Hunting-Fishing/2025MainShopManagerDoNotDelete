
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oudkbrnvommbvtuispla.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
