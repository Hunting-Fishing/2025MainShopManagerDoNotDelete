
import { useState, useCallback } from 'react';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { updateUserProfile, showProfileUpdateToast } from '@/utils/profileUtils';
import { findRoleByName, assignRoleToUser } from '@/utils/roleUtils';

/**
 * Hook for managing team member profile updates including role assignments
 */
export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      if (values.role) {
        try {
          // Find the role ID based on the role name
          const { roleId, error: findRoleError } = await findRoleByName(values.role);
          
          if (findRoleError || !roleId) {
            console.error("Error finding role:", findRoleError);
            roleUpdateMessage = "Could not find the requested role.";
          } else {
            // Attempt to assign the role to the user
            const assignResult = await assignRoleToUser(memberId, roleId);
            roleUpdateSuccess = assignResult.success;
            roleUpdateMessage = assignResult.message;
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
    // Add a reset function to clear errors when needed
    resetError: useCallback(() => setError(null), [])
  };
}
