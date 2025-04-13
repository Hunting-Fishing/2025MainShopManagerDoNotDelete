
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role display name mapping
  const roleDisplayNames: Record<string, string> = {
    'owner': 'Owner',
    'admin': 'Administrator',
    'manager': 'Manager',
    'parts_manager': 'Parts Manager',
    'service_advisor': 'Service Advisor',
    'technician': 'Technician',
    'reception': 'Reception',
    'other_staff': 'Other Staff'
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('priority');
          
        if (error) throw error;
        
        // Map the DB roles to display names
        const mappedRoles = data.map(role => ({
          id: role.id,
          name: role.name,
          displayName: roleDisplayNames[role.name] || role.name,
          description: role.description
        }));
        
        setRoles(mappedRoles);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles');
        toast({
          title: "Error",
          description: "Failed to load roles. Please try again.",
          variant: "destructive"
        });
        // Provide some default roles so the form still works
        setRoles([
          { id: '1', name: 'technician', displayName: 'Technician', description: 'Performs service work' },
          { id: '2', name: 'manager', displayName: 'Manager', description: 'Manages team members' },
          { id: '3', name: 'admin', displayName: 'Administrator', description: 'Administers the system' },
          { id: '4', name: 'owner', displayName: 'Owner', description: 'Business owner' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoles();
  }, []);

  return { roles, isLoading, error };
}
