
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = "https://oudkbrnvommbvtuispla.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4";

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a small amount of data to verify connection
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return false;
  }
};
