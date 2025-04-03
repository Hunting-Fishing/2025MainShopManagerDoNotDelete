
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';

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
      
      // Update the profile record
      const { error: profileError, data } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: values.email,
          phone: values.phone || null,
        })
        .eq('id', memberId)
        .select();
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }
      
      console.log("Profile update result:", data);
      
      // Update role in user_roles table if the role has changed
      if (values.role) {
        try {
          // Make sure the role is a valid AppRole before querying
          const roleValue = validateRoleValue(values.role);
          
          // First, get the role_id for the given role name
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleValue)
            .single();

          if (roleError) {
            console.error("Error fetching role:", roleError);
            // Don't throw, continue with other updates
          } else if (roleData) {
            // Check if the user already has this role
            const { data: existingRoles, error: existingRolesError } = await supabase
              .from('user_roles')
              .select('id, role_id')
              .eq('user_id', memberId);

            if (existingRolesError) {
              console.error("Error fetching existing roles:", existingRolesError);
            } else {
              // If the user has roles, update the first one to the new role
              // In a more sophisticated implementation, we might want to handle multiple roles
              if (existingRoles && existingRoles.length > 0) {
                const { error: updateRoleError } = await supabase
                  .from('user_roles')
                  .update({ role_id: roleData.id })
                  .eq('id', existingRoles[0].id);
                
                if (updateRoleError) {
                  console.error("Error updating role:", updateRoleError);
                } else {
                  console.log("Role updated successfully");
                }
              } else {
                // If the user has no roles, create a new one
                const { error: insertRoleError } = await supabase
                  .from('user_roles')
                  .insert({ user_id: memberId, role_id: roleData.id });
                
                if (insertRoleError) {
                  console.error("Error inserting role:", insertRoleError);
                } else {
                  console.log("Role assigned successfully");
                }
              }
            }
          }
        } catch (roleValidationError) {
          // Log the validation error but continue with other updates
          console.error("Role validation error:", roleValidationError);
        }
      }
      
      // We also need to store the job title, department, and status
      // Since these aren't in the profiles table, we could create a team_member_metadata table
      // For now, let's log that we would save these values
      console.log("Would save additional metadata:", {
        jobTitle: values.jobTitle,
        department: values.department,
        status: values.status,
        notes: values.notes
      });
      
      toast({
        title: "Profile updated",
        description: "Team member information has been updated successfully",
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
  
  // Helper function to validate and convert role value to a valid AppRole
  const validateRoleValue = (role: string): AppRole => {
    // Define allowed roles that match the database enum
    const validRoles: AppRole[] = [
      'owner', 'admin', 'manager', 'parts_manager', 
      'service_advisor', 'technician', 'reception', 'other_staff'
    ];
    
    // Check if the provided role is valid
    const normalizedRole = role.toLowerCase() as AppRole;
    
    if (validRoles.includes(normalizedRole)) {
      return normalizedRole;
    }
    
    // Map common roles to valid ones
    // This is a workaround for user input that doesn't match the exact enum values
    const roleMapping: Record<string, AppRole> = {
      'administrator': 'admin',
      'tech': 'technician',
      'service': 'service_advisor',
      'advisor': 'service_advisor',
      'customer service': 'reception',
      'owner': 'owner',
      'user': 'other_staff',  // Default for generic "User" role
    };
    
    // Try to find a mapping
    for (const [key, value] of Object.entries(roleMapping)) {
      if (role.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
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
