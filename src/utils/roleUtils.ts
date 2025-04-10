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
 * Detects a potential role based on job title
 * @param jobTitle The job title to analyze
 * @returns Suggested role or null if no match
 */
export function detectRoleFromJobTitle(jobTitle: string): string | null {
  const title = jobTitle.toLowerCase();
  
  // Technical roles
  if (title.includes('technician') || 
      title.includes('mechanic') || 
      title.includes('engineer') ||
      title.includes('installer')) {
    return 'Technician';
  }
  
  // Management roles
  if (title.includes('manager') || 
      title.includes('director') || 
      title.includes('supervisor') ||
      title.includes('lead')) {
    return 'Manager';
  }
  
  // Admin roles
  if (title.includes('admin') || 
      title.includes('administrator') || 
      title.includes('coordinator')) {
    return 'Administrator';
  }
  
  // Service advisor roles
  if (title.includes('advisor') || 
      title.includes('consultant') || 
      title.includes('service writer')) {
    return 'Service Advisor';
  }

  // Reception/front desk roles
  if (title.includes('reception') || 
      title.includes('front desk') || 
      title.includes('secretary')) {
    return 'Reception';
  }
  
  // Parts related roles
  if (title.includes('parts') || 
      title.includes('inventory')) {
    return 'Parts Manager';
  }

  // Owner/proprietor roles
  if (title.includes('owner') || 
      title.includes('ceo') || 
      title.includes('president') ||
      title.includes('founder')) {
    return 'Owner';
  }
  
  return null;
}

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
 * Validates that a role string is one of the valid app roles
 */
export const validateRoleName = (role: string): AppRole => {
  const normalizedRole = role.toLowerCase();
  const validRoles: AppRole[] = [
    'owner', 'admin', 'manager', 'parts_manager', 
    'service_advisor', 'technician', 'reception', 'other_staff'
  ];
  
  // Check if normalized role is valid
  if (validRoles.includes(normalizedRole as AppRole)) {
    return normalizedRole as AppRole;
  }
  
  // Map common display names to valid roles
  if (normalizedRole === 'administrator') return 'admin';
  if (normalizedRole === 'parts manager') return 'parts_manager';
  if (normalizedRole === 'service advisor') return 'service_advisor';
  if (normalizedRole === 'other staff') return 'other_staff';
  
  // Default fallback
  return 'other_staff';
};

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
    console.log(`Attempting to assign role ${roleId} to user ${userId}`);
    
    // First check if user already has this role to avoid duplicate key errors
    const hasRole = await checkExistingRole(userId, roleId);
    
    if (hasRole) {
      return {
        success: true,
        message: "Role is already assigned to this user."
      };
    }
    
    // Insert the role assignment directly rather than using RPC
    // This is more reliable for the initial user setup
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId
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
    
    console.log(`Successfully assigned role ${roleId} to user ${userId}`);
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
      .select('id, name')
      .eq('name', roleValue)
      .single();
      
    if (error) {
      console.error("Error finding role:", error);
      return { error: "Could not find the requested role." };
    }
    
    console.log("Found role:", data);
    return { roleId: data.id };
  } catch (error) {
    console.error("Exception in findRoleByName:", error);
    return { error: "An unexpected error occurred while finding the role." };
  }
};

/**
 * Retrieves all roles available in the system
 */
export const fetchAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('priority', { ascending: true });
      
    if (error) {
      console.error("Error fetching roles:", error);
      return { roles: [], error: error.message };
    }
    
    return { roles: data, error: null };
  } catch (error) {
    console.error("Exception in fetchAllRoles:", error);
    return { roles: [], error: "Failed to fetch roles" };
  }
};

// Helper function to get initials from name
export const getInitials = (name: string) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
