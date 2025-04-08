
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://oudkbrnvommbvtuispla.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4";

// Use the client from the integrations folder which has the proper typings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Add a debug function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    // Simple query to test connectivity
    const { data, error } = await supabase.from('customers').select('count').limit(1);
    if (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }
    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
};
