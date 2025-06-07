import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    const fetchDepartments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        // If no departments are found, create default ones
        if (!data || data.length === 0) {
          const defaultDepartments = [
            { name: 'Management', description: 'Company leadership and management' },
            { name: 'Field Service', description: 'On-site technicians and service staff' },
            { name: 'Administration', description: 'Office and administrative staff' },
            { name: 'Customer Support', description: 'Customer service and support team' },
            { name: 'Operations', description: 'Day-to-day operations staff' }
          ];
          
          // Insert default departments
          const { data: insertedData, error: insertError } = await supabase
            .from('departments')
            .insert(defaultDepartments)
            .select();
            
          if (insertError) throw insertError;
          
          setDepartments(insertedData || []);
        } else {
          setDepartments(data);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive"
        });
        // Provide some default departments so the form still works
        setDepartments([
          { id: '1', name: 'Field Service' },
          { id: '2', name: 'Administration' },
          { id: '3', name: 'Management' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);

  const addDepartment = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name, description })
        .select()
        .single();
        
      if (error) throw error;
      
      setDepartments(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding department:', err);
      toast({
        title: "Error",
        description: "Failed to add department.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateDepartment = async (id: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setDepartments(prev => prev.map(dept => dept.id === id ? data : dept));
      return true;
    } catch (err) {
      console.error('Error updating department:', err);
      toast({
        title: "Error",
        description: "Failed to update department.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting department:', err);
      toast({
        title: "Error",
        description: "Failed to delete department. It may be in use by team members.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    departments, 
    isLoading, 
    error, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  };
}
