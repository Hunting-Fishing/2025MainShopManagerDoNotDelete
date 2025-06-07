import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, job_title')
        .not('job_title', 'is', null);

      if (error) throw error;

      const technicianData = (data || []).map((profile) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        jobTitle: profile.job_title
      }));
      
      setTechnicians(technicianData);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setTechnicians([]); // No fallback data
    } finally {
      setIsLoading(false);
    }
  };

  return {
    technicians,
    isLoading,
    error,
    refetch: fetchTechnicians
  };
}
