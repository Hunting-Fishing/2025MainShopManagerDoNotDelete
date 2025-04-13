import { supabase } from '@/lib/supabase';
import { saveProfileMetadata } from '@/lib/profileMetadata';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a user's profile in the Supabase profiles table
 */
export const updateUserProfile = async (
  userId: string, 
  values: TeamMemberFormValues
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Update the profile with all available fields
    const { error, data } = await supabase
      .from('profiles')
      .update({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone || null,
        job_title: values.jobTitle,
        department: values.department,
      })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error("Profile update error:", error);
      return { 
        success: false,
        error: error.message
      };
    }
    
    console.log("Profile update result:", data);
    
    // Save additional metadata if provided
    if (values.notes) {
      try {
        const metadataSaved = await saveProfileMetadata(userId, values.notes);
        if (!metadataSaved) {
          console.warn("Could not save profile metadata, but continuing with other updates");
        }
      } catch (metadataError) {
        console.error("Metadata operation error:", metadataError);
        // Continue with the update even if metadata fails
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error updating user profile:', err);
    return { 
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred'
    };
  }
};

/**
 * Handles showing the appropriate toast message after a profile update
 */
export const showProfileUpdateToast = (
  success: boolean, 
  roleMessage?: string
) => {
  if (!success) {
    toast({
      title: "Update failed",
      description: "Could not update team member information. Please try again.",
      variant: "destructive",
    });
    return;
  }
  
  if (roleMessage) {
    // Role message is present, so include it in the toast
    const isWarning = roleMessage.includes("failed") || 
                      roleMessage.includes("permission") || 
                      roleMessage.includes("Could not");
    
    toast({
      title: "Profile updated",
      description: `Team member information has been updated. ${roleMessage}`,
      variant: isWarning ? "warning" : "default",
    });
  } else {
    // No role message, just a basic success toast
    toast({
      title: "Profile updated",
      description: "Team member information has been updated successfully.",
    });
  }
};
