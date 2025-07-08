import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DatabaseRole {
  id: string;
  name: string;
  description: string | null;
  permissions: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  member_count: number;
  members: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }[];
}

export function useRoles() {
  const [roles, setRoles] = useState<DatabaseRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch roles with member count and member details
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          description,
          permissions,
          is_default,
          created_at,
          updated_at,
          user_roles (
            user_id
          )
        `)
        .order('name');

      if (rolesError) {
        throw rolesError;
      }

      // Transform the data to include member count and member details
      const transformedRoles = rolesData?.map(role => ({
        ...role,
        member_count: role.user_roles?.length || 0,
        members: role.user_roles?.map(ur => ({
          user_id: ur.user_id,
          first_name: null,
          last_name: null,
          email: null,
        })) || []
      })) || [];

      setRoles(transformedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (name: string, description: string, permissions: any) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: name as any, // Cast to bypass enum restriction for custom roles
          description,
          permissions,
          is_default: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchRoles(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Role created successfully",
      });

      return data;
    } catch (err) {
      console.error('Error creating role:', err);
      toast({
        title: "Error", 
        description: "Failed to create role",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateRole = async (roleId: string, updates: Partial<Pick<DatabaseRole, 'name' | 'description' | 'permissions'>>) => {
    try {
      const updateData = {
        ...updates,
        name: updates.name as any // Cast to bypass enum restriction
      };
      const { error } = await supabase
        .from('roles')
        .update(updateData)
        .eq('id', roleId);

      if (error) {
        throw error;
      }

      await fetchRoles(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: "Error",
        description: "Failed to update role", 
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      // First check if role has any assignments
      const { data: assignments } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', roleId);

      if (assignments && assignments.length > 0) {
        throw new Error('Cannot delete role that has assigned members');
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        throw error;
      }

      await fetchRoles(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting role:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete role",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    createRole,
    updateRole,
    deleteRole
  };
}