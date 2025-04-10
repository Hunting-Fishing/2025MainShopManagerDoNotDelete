
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { mapRoleToDbValue } from '@/utils/roleUtils';

/**
 * Hook for handling role assignments
 */
export function useRoleAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  
  /**
   * Assigns a role to a user
   */
  const assignRole = useCallback(async (
    userId: string,
    roleName: string,
    jobTitle?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!roleName) {
        return {
          success: true,
          message: "No role changes requested"
        };
      }
      
      console.log(`Assigning role ${roleName} to user ${userId}`);
      setDetectedRole(roleName);
      
      // Use the utility to convert the display role name to database role name
      const dbRoleName = mapRoleToDbValue(roleName);
      console.log(`Role mapping: ${roleName} -> ${dbRoleName}`);
      
      // Find the role ID using the database role name
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', dbRoleName)
        .single();
      
      if (roleError || !roleData) {
        throw new Error(roleError?.message || "Role not found");
      }
      
      const roleId = roleData.id;
      
      // Insert the user role directly
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId
        });
      
      if (insertError) {
        // Check if the error is due to duplicate key (role already assigned)
        if (insertError.message?.includes('duplicate key value')) {
          return {
            success: true,
            message: "Role is already assigned to this user"
          };
        } else {
          throw new Error(insertError.message || "Failed to assign role");
        }
      }
      
      return {
        success: true,
        message: "Role assigned successfully"
      };
    } catch (err) {
      console.error('Error assigning role:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    assignRole,
    detectedRole,
    isLoading,
    error,
    resetState: useCallback(() => {
      setError(null);
      setDetectedRole(null);
    }, [])
  };
}
