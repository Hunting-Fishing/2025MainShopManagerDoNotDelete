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
 * Validates that a role string is one of the valid app roles
 * @param role The role string to validate
 * @returns The role string if valid, or 'other_staff' as fallback
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
 * Converts a role display name to its database value
 * Uses the existing roleValueMapping
 */
export const getRoleDbValue = (roleName: string): AppRole => {
  // First check if it's in our mapping
  if (roleName in roleValueMapping) {
    return roleValueMapping[roleName] as AppRole;
  }
  
  // If not, validate and normalize the role name
  return validateRoleName(roleName);
};
