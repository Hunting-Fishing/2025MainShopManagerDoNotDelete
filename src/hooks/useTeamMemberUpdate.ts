
import { useState } from 'react';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { updateUserProfile, showProfileUpdateToast } from '@/utils/profileUtils';
import { findRoleByName, assignRoleToUser } from '@/utils/roleUtils';

export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeamMember = async (
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      showProfileUpdateToast(false);
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    updateTeamMember,
    isLoading,
    error,
  };
}
