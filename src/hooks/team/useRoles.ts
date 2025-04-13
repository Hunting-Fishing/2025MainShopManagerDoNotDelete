
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { roleValueMapping } from '@/components/team/form/formConstants';

export interface Role {
  id: string;
  name: string; // Database name (enum)
  displayName: string; // Display name for UI
  description?: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map between DB role names and display names
  const mapRoleToDisplay = (dbRole: string): string => {
    const entry = Object.entries(roleValueMapping).find(([_, value]) => value === dbRole);
    return entry ? entry[0] : dbRole;
  };

  useEffect(() => {
    async function fetchRoles() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('priority');
        
        if (error) throw error;
        
        // Map the DB roles to display roles
        const mappedRoles = data?.map(role => ({
          id: role.id,
          name: role.name,
          displayName: mapRoleToDisplay(role.name),
          description: role.description
        })) || [];
        
        setRoles(mappedRoles);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles');
        toast({
          title: 'Error',
          description: 'Failed to load roles',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoles();
  }, []);

  return {
    roles,
    isLoading,
    error
  };
}
