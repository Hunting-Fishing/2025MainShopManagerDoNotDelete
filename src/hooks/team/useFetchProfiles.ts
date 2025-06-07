
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

      // Process profiles and map them with status from metadata
      return (profiles || [])
        .filter(profile => {
          // Check metadata for deletion status
          const profileMetadata = profile.profile_metadata?.[0];
          // If metadata is available, safely check its properties
          if (profileMetadata && profileMetadata.metadata) {
            const metadata = profileMetadata.metadata;
            // Check if metadata is an object and has the required properties
            if (typeof metadata === 'object' && metadata !== null) {
              // Use type assertion to access properties safely
              const typedMetadata = metadata as Record<string, any>;
              // Only filter out if status is explicitly 'deleted'
              return typedMetadata.status !== 'deleted';
            }
          }
          // If no metadata or structure is different, include the profile (default behavior)
          return true;
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
          is_active: (() => {
            const metadata = profile.profile_metadata?.[0]?.metadata;
            if (typeof metadata === 'object' && metadata !== null) {
              // Use type assertion to access properties safely
              const typedMetadata = metadata as Record<string, any>;
              return typedMetadata.is_active !== false; // Default to true if not explicitly set to false
            }
            return true; // Default to active if no metadata or wrong format
          })()
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
