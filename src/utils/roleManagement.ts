
import { supabase } from '@/lib/supabase';
import { Role } from '@/types/team';
import { AppRole } from './roleMapping';

/**
 * Checks if a user already has a specific role
 * Uses error handling for the case where no role is found
 */
export const checkExistingRole = async (userId: string, roleId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();
      
    // If we find data, the user has this role
    if (data) {
      return true;
    }
    
    // PGRST116 means no rows found, which is expected if the role isn't assigned
    if (error && error.code === 'PGRST116') {
      return false;
    }
    
    // Log other errors but don't throw
    if (error) {
      console.error("Error checking existing role:", error);
    }
    
    return false;
  } catch (error) {
    console.error("Exception when checking role:", error);
    return false;
  }
};

/**
 * Assigns a role to a user if they don't already have it
 */
export const assignRoleToUser = async (userId: string, roleId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // First check if user already has this role to avoid duplicate key errors
    const hasRole = await checkExistingRole(userId, roleId);
    
    if (hasRole) {
      return {
        success: true,
        message: "Role is already assigned to this user."
      };
    }
    
    // Use the RPC function to assign the role
    const { data, error } = await supabase
      .rpc('assign_role_to_user', { 
        user_id_param: userId, 
        role_id_param: roleId 
      });
      
    if (error) {
      console.error("Error assigning role:", error);
      
      if (error.code === '42501' || error.message?.includes('permission')) {
        return {
          success: false,
          message: "You don't have permission to assign roles. Only admins and owners can assign roles."
        };
      } else if (error.message?.includes('duplicate key value') || error.message?.includes('unique constraint')) {
        // Handle the duplicate key error explicitly, though our check above should prevent this
        console.log("Role already assigned to user - caught duplicate key error");
        return {
          success: true,
          message: "Role is already assigned to this user."
        };
      } else {
        return {
          success: false,
          message: "Role assignment failed. Please try again or contact an administrator."
        };
      }
    }
    
    return {
      success: true,
      message: "Role assigned successfully."
    };
  } catch (error) {
    console.error("Error in assignRoleToUser:", error);
    return {
      success: false,
      message: "An unexpected error occurred while assigning the role."
    };
  }
};

/**
 * Finds a role by its display name and returns the database role ID
 */
export const findRoleByName = async (roleName: string): Promise<{
  roleId?: string;
  error?: string;
}> => {
  try {
    const { mapRoleToDbValue } = await import('./roleMapping');
    const roleValue = mapRoleToDbValue(roleName);
    console.log(`Finding role for: ${roleName}, mapped to DB value: ${roleValue}`);
    
    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleValue)
      .single();
      
    if (error) {
      console.error("Error finding role:", error);
      return { error: "Could not find the requested role." };
    }
    
    return { roleId: data.id };
  } catch (error) {
    console.error("Exception in findRoleByName:", error);
    return { error: "An unexpected error occurred while finding the role." };
  }
};
