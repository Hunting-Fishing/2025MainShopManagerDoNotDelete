
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        
        const formattedTechnicians = data?.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
          jobTitle: profile.job_title || undefined,
        })) || [];
        
        setTechnicians(formattedTechnicians);
      } catch (err) {
        console.error('Error fetching technicians:', err);
        setError('Failed to load technicians');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  return { technicians, loading, error };
}
