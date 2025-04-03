
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { roleValueMapping } from '@/components/team/form/formConstants';

// Define the valid role types that match the database enum
type AppRole = 'owner' | 'admin' | 'manager' | 'parts_manager' | 'service_advisor' | 'technician' | 'reception' | 'other_staff';

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
      
      // Parse the name into first and last components
      const nameParts = values.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Update the profile with all available fields including the new columns
      const { error: profileError, data } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: values.email,
          phone: values.phone || null,
          job_title: values.jobTitle, // Using the new job_title column
          department: values.department, // Using the new department column
        })
        .eq('id', memberId)
        .select();
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }
      
      console.log("Profile update result:", data);
      
      // Save additional metadata in the profile_metadata table if needed
      if (values.notes) {
        try {
          // First check if a metadata record exists
          const { data: existingMetadata, error: fetchError } = await supabase
            .from('profile_metadata')
            .select('id')
            .eq('profile_id', memberId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error fetching profile metadata:", fetchError);
          }
          
          if (existingMetadata) {
            // Update existing metadata
            const { error: updateError } = await supabase
              .from('profile_metadata')
              .update({
                metadata: { notes: values.notes }
              })
              .eq('profile_id', memberId);
              
            if (updateError) {
              console.error("Error updating profile metadata:", updateError);
            }
          } else {
            // Create new metadata
            const { error: insertError } = await supabase
              .from('profile_metadata')
              .insert({
                profile_id: memberId,
                metadata: { notes: values.notes }
              });
              
            if (insertError) {
              console.error("Error inserting profile metadata:", insertError);
            }
          }
        } catch (metadataError) {
          console.error("Metadata operation error:", metadataError);
          // Continue with the update even if metadata fails
        }
      }
      
      // Handle role updates - this requires admin privileges
      if (values.role) {
        try {
          // Map the display role to the database role value
          const roleValue = mapRoleToDbValue(values.role);
          console.log(`Role update would set user to ${roleValue} role`);
          
          // First, get the role_id based on the role name
          const { data: roleData, error: roleQueryError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleValue)
            .single();
            
          if (roleQueryError) {
            console.error("Error finding role:", roleQueryError);
            // Continue with other updates even if role lookup fails
          } else if (roleData) {
            // First, check if the user already has a role and delete it
            const { error: deleteRoleError } = await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', memberId);
            
            if (deleteRoleError) {
              console.error("Error removing existing role:", deleteRoleError);
              // Continue anyway to try inserting the new role
            }
            
            // Now insert using the role_id
            const { error: roleInsertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: memberId, 
                role_id: roleData.id 
              });
              
            if (roleInsertError) {
              console.error("Error inserting role:", roleInsertError);
              // This error is expected for non-admin users, we'll handle it gracefully
            }
          }
        } catch (roleValidationError) {
          console.error("Role validation error:", roleValidationError);
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Team member information has been updated successfully. Role changes may require admin access.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating team member:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Update failed",
        description: "Could not update team member information. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to map role display names to database values
  const mapRoleToDbValue = (role: string): AppRole => {
    // If the role is in the mapping, use that value
    if (role in roleValueMapping) {
      return roleValueMapping[role] as AppRole;
    }
    
    // Otherwise normalize the role name and try to match it
    const normalizedRole = role.toLowerCase();
    
    // Check if the normalized role matches any of the valid database roles
    const validDbRoles: AppRole[] = [
      'owner', 'admin', 'manager', 'parts_manager', 
      'service_advisor', 'technician', 'reception', 'other_staff'
    ];
    
    if (validDbRoles.includes(normalizedRole as AppRole)) {
      return normalizedRole as AppRole;
    }
    
    // If no mapping found, default to 'other_staff'
    console.warn(`Role "${role}" not recognized, defaulting to "other_staff"`);
    return 'other_staff';
  };
  
  return {
    updateTeamMember,
    isLoading,
    error,
  };
}
