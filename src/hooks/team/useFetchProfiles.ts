
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  created_at: string;
}

/**
 * Hook for fetching user profiles from Supabase
 */
export function useFetchProfiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async (): Promise<Profile[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all profiles from Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          department,
          created_at
        `);

      if (profilesError) {
        throw profilesError;
      }

      return profiles || [];
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProfiles,
    isLoading,
    error
  };
}
