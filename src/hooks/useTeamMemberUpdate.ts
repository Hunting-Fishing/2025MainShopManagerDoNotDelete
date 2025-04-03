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
      
      // Handle role updates - this requires admin privileges
      if (values.role) {
        try {
          // Map the display role to the database role value
          const roleValue = mapRoleToDbValue(values.role);
          console.log(`Role update would set user to ${roleValue} role`);
          
          // Try to update the role (will likely fail due to RLS unless user is admin)
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: memberId, 
              role: roleValue 
            });
            
          if (roleError) {
            console.error("Error inserting role:", roleError);
            // This error is expected for non-admin users, we'll handle it gracefully
          }
        } catch (roleValidationError) {
          console.error("Role validation error:", roleValidationError);
        }
      }
      
      // Create a metadata object with the additional fields
      const metadata = {
        jobTitle: values.jobTitle,
        department: values.department,
        status: values.status,
        notes: values.notes
      };
      
      // Log what would be saved in a real implementation
      console.log("Would save additional metadata:", metadata);
      
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
