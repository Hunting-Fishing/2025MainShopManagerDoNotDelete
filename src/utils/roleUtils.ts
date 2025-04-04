import { supabase } from '@/lib/supabase';

// Define the valid role types that match the database enum
export type AppRole = 'owner' | 'admin' | 'manager' | 'parts_manager' | 'service_advisor' | 'technician' | 'reception' | 'other_staff';

// Map display roles to database enum values
export const roleValueMapping: Record<string, string> = {
  "Owner": "owner",
  "Administrator": "admin", 
  "Manager": "manager",
  "Parts Manager": "parts_manager",
  "Service Advisor": "service_advisor",
  "Technician": "technician",
  "Reception": "reception",
  "Other Staff": "other_staff",
  "Customer Service": "reception" // Alias for backward compatibility
};

/**
 * Maps a display role name to its corresponding database value
 */
export const mapRoleToDbValue = (role: string): AppRole => {
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

/**
 * Checks if a user already has a specific role
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
    // First check if user already has this role
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

/**
 * Exports roles as a JSON file for download
 */
export const exportRolesToJson = (roles: Role[], filename = "team-roles"): void => {
  const jsonStr = JSON.stringify(roles, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
};

/**
 * Validates imported role data
 */
export const validateImportedRoles = (roles: any[]): { valid: boolean; message?: string } => {
  // Check if it's an array
  if (!Array.isArray(roles)) {
    return { valid: false, message: "Imported data is not a valid array" };
  }
  
  // Check if array is empty
  if (roles.length === 0) {
    return { valid: false, message: "No roles found in the imported file" };
  }
  
  // Check if each item has required properties
  for (const role of roles) {
    if (!role.id || !role.name || !role.permissions) {
      return { 
        valid: false, 
        message: "One or more roles are missing required properties (id, name, permissions)" 
      };
    }
    
    // Add priority if it doesn't exist
    if (role.priority === undefined) {
      role.priority = 999; // High value to put at end of list
    }
  }
  
  return { valid: true };
};
