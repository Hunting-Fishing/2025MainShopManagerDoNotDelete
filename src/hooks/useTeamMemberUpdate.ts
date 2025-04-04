
import { useState, useCallback } from 'react';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { updateUserProfile, showProfileUpdateToast } from '@/utils/profileUtils';
import { findRoleByName, assignRoleToUser } from '@/utils/roleUtils';
import { detectRoleFromJobTitle, getRoleDbValue } from '@/utils/roleDetectionUtils';

/**
 * Hook for managing team member profile updates including role assignments
 */
export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  /**
   * Updates a team member's profile information and role
   * Using useCallback to prevent unnecessary re-renders and maintain reference stability
   */
  const updateTeamMember = useCallback(async (
    memberId: string, 
    values: TeamMemberFormValues
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Updating team member with ID:", memberId);
      console.log("Update values:", values);
      
      // Step 1: Update the user's profile information
      const profileUpdateResult = await updateUserProfile(memberId, values);
      
      if (!profileUpdateResult.success) {
        throw new Error(profileUpdateResult.error || "Failed to update profile");
      }
      
      // Step 2: Handle role updates if a role was provided
      let roleUpdateSuccess = false;
      let roleUpdateMessage = "";
      
      // If no explicit role was provided, try to detect it from job title
      const roleToAssign = values.role || (values.jobTitle ? detectRoleFromJobTitle(values.jobTitle) : null);
      
      if (roleToAssign) {
        try {
          // Find the role ID based on the role name
          const { roleId, error: findRoleError } = await findRoleByName(roleToAssign);
          
          if (findRoleError || !roleId) {
            console.error("Error finding role:", findRoleError);
            roleUpdateMessage = "Could not find the requested role.";
          } else {
            // Attempt to assign the role to the user
            const assignResult = await assignRoleToUser(memberId, roleId);
            roleUpdateSuccess = assignResult.success;
            
            // Handle duplicate role assignments gracefully
            if (assignResult.message.includes("already assigned")) {
              roleUpdateSuccess = true;
              roleUpdateMessage = "User already has this role.";
            } else {
              roleUpdateMessage = assignResult.message;
            }
            
            // Store the auto-detected role if it was used
            if (!values.role && values.jobTitle) {
              setDetectedRole(roleToAssign);
            }
          }
        } catch (roleValidationError) {
          console.error("Role validation error:", roleValidationError);
          roleUpdateMessage = "Invalid role selection.";
        }
      }
      
      // Show the appropriate toast message based on results
      showProfileUpdateToast(true, roleUpdateMessage || undefined);
      
      return true;
    } catch (err) {
      console.error('Error updating team member:', err);
      
      // Improved error handling with more specific error messages
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Show error toast but don't let the UI freeze
      showProfileUpdateToast(false, errorMessage);
      
      return false;
    } finally {
      // Always reset loading state to prevent UI from being stuck
      setIsLoading(false);
    }
  }, []); // Empty dependency array since this doesn't depend on any props or state
  
  return {
    updateTeamMember,
    isLoading,
    error,
    detectedRole,
    // Add a reset function to clear errors and state
    resetError: useCallback(() => {
      setError(null);
      setDetectedRole(null);
    }, [])
  };
}
