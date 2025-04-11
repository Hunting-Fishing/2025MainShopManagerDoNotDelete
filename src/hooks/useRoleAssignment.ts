
import { useState, useCallback } from 'react';
import { assignRoleToUser, findRoleByName } from '@/utils/roleUtils';
import { recordTeamMemberHistory } from '@/utils/teamHistoryUtils';
import { supabase } from '@/lib/supabase';

/**
 * Hook for handling role assignments
 */
export function useRoleAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
      if (error) {
        console.error("Error finding current role:", error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Error finding current role:', err);
      return { data: null, error: err };
    }
  };

  /**
   * Assigns a role to a user
   */
  const assignRole = useCallback(async (
    userId: string,
    roleName: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Assigning role "${roleName}" to user ${userId}`);
      
      // Get previous role for history tracking
      const { data: previousRoles } = await findUserCurrentRole(userId);
      const previousRole = previousRoles?.length > 0 ? previousRoles[0].roles?.name : null;
      
      // Find the role by name
      const { roleId, error: findError } = await findRoleByName(roleName);
      
      if (findError || !roleId) {
        throw new Error(findError || `Role "${roleName}" not found`);
      }
      
      // Assign the role to the user - this function handles duplicate checks
      const result = await assignRoleToUser(userId, roleId);
      
      if (result.success) {
        console.log(`Successfully assigned role "${roleName}" to user ${userId}`);
        
        // Get user info to include in history record
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id || 'system';
        
        // Get user name from profiles for better history display
        const { data: userData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', currentUserId)
          .single();
          
        const userName = userData ? 
          `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
          'System';
        
        // Record the role change in history
        await recordTeamMemberHistory({
          profile_id: userId,
          action_type: 'role_change',
          action_by: currentUserId,
          action_by_name: userName,
          details: {
            previous_role: previousRole,
            new_role: roleName,
            timestamp: new Date().toISOString()
          }
        });
        
        console.log('Role change recorded in history');
      } else {
        console.error(`Failed to assign role: ${result.message}`);
      }
      
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

  return {
    assignRole,
    isLoading,
    error,
    resetState: useCallback(() => {
      setError(null);
    }, [])
  };
}
