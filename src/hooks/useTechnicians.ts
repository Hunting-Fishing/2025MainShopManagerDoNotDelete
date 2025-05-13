
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Query profiles table for staff with technician-related job titles
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title, profile_metadata(metadata)')
          .or('job_title.eq.Technician,job_title.ilike.%tech%,job_title.ilike.%mechanic%')
          .order('first_name', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Format the technician list with full names
        let techList = data
          .filter(profile => {
            // Skip profiles marked as deleted or inactive in metadata
            const metadata = profile.profile_metadata?.[0]?.metadata;
            if (metadata && typeof metadata === 'object' && metadata !== null) {
              const typedMetadata = metadata as Record<string, any>;
              if (typedMetadata.status === 'deleted' || typedMetadata.is_active === false) {
                return false;
              }
            }
            return true;
          })
          .map(tech => ({
            id: tech.id,
            name: `${tech.first_name || ''} ${tech.last_name || ''}`.trim(),
            jobTitle: tech.job_title
          }))
          .filter(tech => tech.name.length > 0);
        
        // Add an "Unassigned" option at the beginning
        techList.unshift({
          id: '_unassigned',
          name: 'Unassigned',
          jobTitle: ''
        });
        
        setTechnicians(techList);
      } catch (err) {
        console.error("Error fetching technicians:", err);
        setError('Failed to load technicians');
        toast({
          title: "Error",
          description: "Failed to load technicians. Please try again.",
          variant: "destructive"
        });
        // Provide a default option so the form still works
        setTechnicians([{ id: '_unassigned', name: 'Unassigned', jobTitle: '' }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTechnicians();
  }, []);

  return { technicians, isLoading, error };
}
