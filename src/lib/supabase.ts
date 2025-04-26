
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Function to check if the Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('customers').select('count').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection check exception:', error);
    return false;
  }
};

// Make sure to export the typed client
export default supabase;
