
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
          .select('id, first_name, last_name, job_title')
          .or('job_title.eq.Technician,job_title.ilike.%tech%,job_title.ilike.%mechanic%')
          .order('first_name', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Format the technician list with full names
        const techList = data?.map(tech => ({
          id: tech.id,
          name: `${tech.first_name || ''} ${tech.last_name || ''}`.trim(),
          jobTitle: tech.job_title
        })).filter(tech => tech.name.length > 0) || [];
        
        // Add an "Unassigned" option at the beginning if needed
        if (techList.length === 0 || !techList.some(t => t.id === '_unassigned')) {
          techList.unshift({
            id: '_unassigned',
            name: 'Unassigned',
            jobTitle: undefined // Adding jobTitle property even though it's undefined
          });
        }
        
        setTechnicians(techList);
      } catch (err) {
        console.error("Error fetching technicians:", err);
        setError('Failed to load technicians');
        toast({
          title: "Error",
          description: "Failed to load technicians. Using default values.",
          variant: "destructive"
        });
        
        // Provide default technicians if the fetch fails
        setTechnicians([
          { id: '_unassigned', name: 'Unassigned', jobTitle: undefined },
          { id: 'john-doe', name: 'John Doe', jobTitle: 'Senior Technician' },
          { id: 'jane-smith', name: 'Jane Smith', jobTitle: 'Technician' },
          { id: 'bob-johnson', name: 'Bob Johnson', jobTitle: 'Junior Technician' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTechnicians();
  }, []);

  return { technicians, isLoading, error };
}
