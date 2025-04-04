
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { roleValueMapping } from '@/components/team/form/formConstants';
import { saveProfileMetadata } from '@/lib/profileMetadata';

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
          job_title: values.jobTitle,
          department: values.department,
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
          // Use our helper function to save notes metadata
          const metadataSaved = await saveProfileMetadata(memberId, { notes: values.notes });
          if (!metadataSaved) {
            console.warn("Could not save profile metadata, but continuing with other updates");
          }
        } catch (metadataError) {
          console.error("Metadata operation error:", metadataError);
          // Continue with the update even if metadata fails
        }
      }
      
      // Handle role updates - this requires admin privileges
      let roleUpdateSuccess = false;
      let roleUpdateMessage = "";
      
      if (values.role) {
        try {
          // Map the display role to the database role value
          const roleValue = mapRoleToDbValue(values.role);
          console.log(`Attempting to assign role: ${roleValue}`);
          
          // First, get the role_id based on the role name
          const { data: roleData, error: roleQueryError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleValue)
            .single();
            
          if (roleQueryError) {
            console.error("Error finding role:", roleQueryError);
            roleUpdateMessage = "Could not find the requested role.";
          } else if (roleData) {
            console.log("Found role with ID:", roleData.id);
            
            // First check if the user already has this role
            const { data: existingRole, error: checkRoleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', memberId)
              .eq('role_id', roleData.id);
              
            if (checkRoleError) {
              console.error("Error checking existing role:", checkRoleError);
            }
            
            // If user already has this role, don't try to assign it again
            if (existingRole && existingRole.length > 0) {
              console.log("User already has this role:", roleData.id);
              roleUpdateSuccess = true;
              roleUpdateMessage = "Role is already assigned to this user.";
            } else {
              // Use the RPC function to assign the role
              const { data: rpcData, error: roleRpcError } = await supabase
                .rpc('assign_role_to_user', { 
                  user_id_param: memberId, 
                  role_id_param: roleData.id 
                });
                
              if (roleRpcError) {
                console.error("Error assigning role:", roleRpcError);
                
                if (roleRpcError.code === '42501' || roleRpcError.message?.includes('permission')) {
                  roleUpdateMessage = "You don't have permission to assign roles. Only admins and owners can assign roles.";
                } else if (roleRpcError.message?.includes('duplicate key value') || roleRpcError.message?.includes('unique constraint')) {
                  // Handle the duplicate key error explicitly
                  console.log("Role already assigned to user - caught duplicate key error");
                  roleUpdateSuccess = true;
                  roleUpdateMessage = "Role is already assigned to this user.";
                } else {
                  roleUpdateMessage = "Role assignment failed. Please try again or contact an administrator.";
                }
              } else {
                console.log("Role assignment result:", rpcData);
                roleUpdateSuccess = true;
                roleUpdateMessage = "Role assigned successfully.";
              }
            }
          }
        } catch (roleValidationError) {
          console.error("Role validation error:", roleValidationError);
          roleUpdateMessage = "Invalid role selection.";
        }
      }
      
      // Create appropriate toast message based on results
      if (roleUpdateMessage) {
        toast({
          title: "Profile updated",
          description: `Team member information has been updated. ${roleUpdateMessage}`,
          variant: roleUpdateSuccess ? "default" : "warning",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Team member information has been updated successfully.",
        });
      }
      
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
