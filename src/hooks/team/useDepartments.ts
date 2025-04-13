
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setDepartments(data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
        toast({
          title: 'Error',
          description: 'Failed to load departments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDepartments();
  }, []);

  const createDepartment = async (name: string, description?: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('departments')
        .insert([{ name, description }])
        .select()
        .single();
      
      if (error) throw error;
      
      setDepartments(prev => [...prev, data]);
      
      toast({
        title: 'Department created',
        description: `${name} department has been added`,
      });
      
      return data;
    } catch (err) {
      console.error('Error creating department:', err);
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    departments,
    isLoading,
    error,
    createDepartment
  };
}
