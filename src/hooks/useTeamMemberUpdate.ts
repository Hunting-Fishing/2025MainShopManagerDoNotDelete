
import { useState, useCallback } from 'react';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { showProfileUpdateToast } from '@/utils/profileUtils';
import { useProfileUpdate } from './team/useProfileUpdate';
import { useRoleAssignment } from './team/useRoleAssignment';
import { recordTeamMemberHistory } from '@/utils/teamHistoryUtils';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing team member profile updates including role assignments
 */
export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile, error: profileError } = useProfileUpdate();
  const { assignRole, detectedRole, error: roleError } = useRoleAssignment();
  const { toast } = useToast();

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
      console.log("Update values:", values);
      
      // Step 1: Update the user's profile information
      const profileData = {
        name: values.name,
        email: values.email, 
        phone: values.phone,
        jobTitle: values.jobTitle,
        department: values.department,
        notes: values.notes
      };
      
      // Track which fields were updated
      const updatedFields: string[] = [];
      Object.entries(profileData).forEach(([key, value]) => {
        if (value) updatedFields.push(key);
      });
      
      const profileUpdateSuccess = await updateProfile(memberId, profileData);
      
      if (!profileUpdateSuccess) {
        throw new Error(profileError || "Failed to update profile");
      }
      
      // Record profile update in history
      await recordTeamMemberHistory({
        profile_id: memberId,
        action_type: 'update',
        action_by: 'current_user', // Will be replaced with actual user ID
        details: {
          fields: updatedFields,
          timestamp: new Date().toISOString()
        }
      });
      
      // Step 2: Handle role updates if needed
      console.log("Assigning role:", values.role);
      const roleResult = await assignRole(memberId, values.role, values.jobTitle);
      
      if (!roleResult.success) {
        // We'll show a warning but not fail the whole update
        console.warn("Role assignment issue:", roleResult.message);
        toast({
          title: "Profile Updated",
          description: `Profile updated but role could not be changed: ${roleResult.message}`,
          variant: "warning"
        });
        return true;
      }
      
      // Show the appropriate toast message based on results
      toast({
        title: "Success",
        description: `Team member profile and role updated successfully to ${values.role}`,
        variant: "default"
      });
      
      return true;
    } catch (err) {
      console.error('Error updating team member:', err);
      
      // Show error toast but don't let the UI freeze
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Always reset loading state to prevent UI from being stuck
      setIsLoading(false);
    }
  }, [updateProfile, assignRole, profileError, toast]);
  
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
