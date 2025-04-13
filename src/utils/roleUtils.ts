
import { roleValueMapping } from '@/components/team/form/formConstants';

/**
 * Converts a display role name to the database role value
 */
export function mapRoleToDbValue(displayRole: string): string {
  const mappedValue = roleValueMapping[displayRole];
  
  // In case the role isn't in our mapping or is already a DB value
  return mappedValue !== undefined ? mappedValue : displayRole.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Detects an appropriate role based on the job title
 */
export function detectRoleFromJobTitle(jobTitle: string): string | null {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('tech') || title.includes('mechanic')) {
    return 'Technician';
  } else if (title.includes('admin')) {
    return 'Administrator';
  } else if (title.includes('manager') || title.includes('supervisor')) {
    return 'Manager';
  } else if (title.includes('advisor') || title.includes('consultant')) {
    return 'Service Advisor';
  } else if (title.includes('owner') || title.includes('ceo') || title.includes('president')) {
    return 'Owner';
  } else if (title.includes('recept') || title.includes('front desk')) {
    return 'Reception';
  } else if (title.includes('parts')) {
    return 'Parts Manager';
  }
  
  return null;
}

/**
 * Checks if a user has permission to manage departments
 * (Currently only owners and administrators)
 */
export function canManageDepartments(userRole: string): boolean {
  const managementRoles = ['owner', 'admin', 'administrator'];
  return managementRoles.includes(userRole.toLowerCase());
}

/**
 * Validates that the role string matches expected database role values
 * Returns a valid role or defaults to 'other_staff'
 */
export function validateRoleValue(role: string): "admin" | "manager" | "owner" | "parts_manager" | "service_advisor" | "technician" | "reception" | "other_staff" {
  // List of valid db role values
  const validRoles = ['admin', 'manager', 'owner', 'parts_manager', 'service_advisor', 'technician', 'reception', 'other_staff'];
  
  // Convert to lowercase and remove spaces
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
  
  // Check if the normalized role is valid
  if (validRoles.includes(normalizedRole)) {
    return normalizedRole as any;
  }
  
  // Default to other_staff if not valid
  console.warn(`Invalid role value "${role}" normalized to "other_staff"`);
  return 'other_staff';
}
