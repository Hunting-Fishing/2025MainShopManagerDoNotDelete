
import { useState, useCallback } from 'react';
import { findRoleByName, assignRoleToUser } from '@/utils/roleManagement';

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
      
      // Use the utility to find the role ID from the role name
      const { roleId, error: findRoleError } = await findRoleByName(roleName);
      
      if (findRoleError || !roleId) {
        throw new Error(findRoleError || "Role not found");
      }
      
      // Assign the role to the user
      const result = await assignRoleToUser(userId, roleId);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return {
        success: true,
        message: result.message || "Role assigned successfully"
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
