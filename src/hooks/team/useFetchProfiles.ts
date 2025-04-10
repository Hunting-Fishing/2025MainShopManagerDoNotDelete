
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
  is_active?: boolean; // Add flag to track active status
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
      // Fetch all profiles from Supabase with their metadata for status
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
          created_at,
          profile_metadata!left (
            metadata
          )
        `);

      if (profilesError) {
        throw profilesError;
      }

      // Filter out deleted/inactive profiles
      return (profiles || [])
        .filter(profile => {
          // Check metadata for deletion status
          const metadata = profile.profile_metadata?.metadata;
          // If no metadata or is_active is true (or not set), include profile
          return !metadata || 
                 typeof metadata.is_active === 'undefined' || 
                 metadata.status !== 'deleted';
        })
        .map(profile => ({
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || null,
          job_title: profile.job_title || null,
          department: profile.department || null,
          created_at: profile.created_at,
          is_active: profile.profile_metadata?.metadata?.is_active !== false // Default to true if not set
        }));
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
