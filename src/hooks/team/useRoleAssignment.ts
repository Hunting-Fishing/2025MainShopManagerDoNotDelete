
import { useState, useCallback } from 'react';
import { assignRoleToUser, findRoleByName, detectRoleFromJobTitle } from '@/utils/roleUtils';
import { recordTeamMemberHistory } from '@/utils/teamHistoryUtils';

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
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get previous role for history tracking
      const { data: previousRoles } = await findUserCurrentRole(userId);
      const previousRole = previousRoles?.length > 0 ? previousRoles[0].roles.name : null;
      
      // Find the role by name
      const { roleId, error: findError } = await findRoleByName(roleName);
      
      if (findError || !roleId) {
        throw new Error(findError || "Role not found");
      }
      
      // Assign the role to the user
      const result = await assignRoleToUser(userId, roleId);
      
      // Record the role change in history
      await recordTeamMemberHistory({
        profile_id: userId,
        action_type: 'role_change',
        action_by: 'current_user', // Will be replaced with actual user ID
        details: {
          previous_role: previousRole,
          new_role: roleName,
          timestamp: new Date().toISOString()
        }
      });
      
      return result;
    } catch (err) {
      console.error('Error assigning role:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Detect a role from a job title
   */
  const detectRole = useCallback((jobTitle: string) => {
    try {
      const detected = detectRoleFromJobTitle(jobTitle);
      setDetectedRole(detected);
      return detected;
    } catch (err) {
      console.error('Error detecting role:', err);
      return null;
    }
  }, []);

  /**
   * Find a user's current role for history tracking
   */
  const findUserCurrentRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles:role_id(
            id,
            name
          )
        `)
        .eq('user_id', userId);
        
      return { data, error };
    } catch (err) {
      console.error('Error finding current role:', err);
      return { data: null, error: err };
    }
  };

  return {
    assignRole,
    detectRole,
    isLoading,
    error,
    detectedRole,
    resetState: useCallback(() => {
      setError(null);
      setDetectedRole(null);
    }, [])
  };
}
