import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if we can connect to the Supabase database
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to connect to the Supabase database (lightweight query)
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    // Log the connection status for debugging
    console.info('Supabase connection status:', !error);
    
    return !error;
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    return false;
  }
};
