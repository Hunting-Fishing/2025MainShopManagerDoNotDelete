
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the existing client from integrations/supabase/client
export const supabase = supabaseClient;

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
