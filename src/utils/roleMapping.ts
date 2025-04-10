/**
 * Role mapping utilities for handling role conversion between UI and database
 */

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
