
import { useState, useCallback } from 'react';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { showProfileUpdateToast } from '@/utils/profileUtils';
import { useProfileUpdate } from './team/useProfileUpdate';
import { useRoleAssignment } from './team/useRoleAssignment';

/**
 * Hook for managing team member profile updates including role assignments
 */
export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile, error: profileError } = useProfileUpdate();
  const { assignRole, detectedRole, error: roleError } = useRoleAssignment();

  /**
   * Updates a team member's profile information and role
   */
  const updateTeamMember = useCallback(async (
    memberId: string, 
    values: TeamMemberFormValues
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Updating team member with ID:", memberId);
      
      // Step 1: Update the user's profile information
      const profileUpdateSuccess = await updateProfile(memberId, values);
      
      if (!profileUpdateSuccess) {
        throw new Error(profileError || "Failed to update profile");
      }
      
      // Step 2: Handle role updates if needed
      const roleResult = await assignRole(memberId, values.role, values.jobTitle);
      
      // Show the appropriate toast message based on results
      showProfileUpdateToast(true, roleResult.message || undefined);
      
      return true;
    } catch (err) {
      console.error('Error updating team member:', err);
      
      // Show error toast but don't let the UI freeze
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      showProfileUpdateToast(false, errorMessage);
      
      return false;
    } finally {
      // Always reset loading state to prevent UI from being stuck
      setIsLoading(false);
    }
  }, [updateProfile, assignRole, profileError]);
  
  return {
    updateTeamMember,
    isLoading,
    error: profileError || roleError,
    detectedRole,
    // Add a reset function to clear errors and state
    resetError: useCallback(() => {
      // This will call both reset functions internally
      useProfileUpdate().resetError();
      useRoleAssignment().resetState();
    }, [])
  };
}
