
import { useState, useCallback } from 'react';
import { findRoleByName, assignRoleToUser, detectRoleFromJobTitle } from '@/utils/roleUtils';

/**
 * Hook for handling role assignments
 */
export function useRoleAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const assignRole = useCallback(async (
    memberId: string,
    roleName: string | null,
    jobTitle?: string
  ): Promise<{success: boolean, message: string}> => {
    if (!roleName && !jobTitle) {
      return { success: true, message: "" };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // If no explicit role was provided, try to detect it from job title
      const roleToAssign = roleName || (jobTitle ? detectRoleFromJobTitle(jobTitle) : null);
      
      if (!roleToAssign) {
        return { success: true, message: "" };
      }

      // Store the auto-detected role if it was used
      if (!roleName && jobTitle && roleToAssign) {
        setDetectedRole(roleToAssign);
      }
      
      // Find the role ID based on the role name
      const { roleId, error: findRoleError } = await findRoleByName(roleToAssign);
      
      if (findRoleError || !roleId) {
        console.error("Error finding role:", findRoleError);
        setError(findRoleError || "Could not find the requested role.");
        return { success: false, message: "Could not find the requested role." };
      }
      
      // Attempt to assign the role to the user
      const assignResult = await assignRoleToUser(memberId, roleId);
      
      // Handle duplicate role assignments gracefully
      if (assignResult.message.includes("already assigned")) {
        return { success: true, message: "User already has this role." };
      }
      
      return { 
        success: assignResult.success, 
        message: assignResult.message
      };
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
    detectedRole,
    resetState: useCallback(() => {
      setError(null);
      setDetectedRole(null);
    }, [])
  };
}
