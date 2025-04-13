
import { roleJobTitleMap } from '@/components/team/form/jobTitleData';

// Convert a display role name to the database role name
export function mapRoleToDbValue(displayRoleName: string): string {
  const roleMap: Record<string, string> = {
    'Owner': 'owner',
    'Administrator': 'admin',
    'Manager': 'manager',
    'Parts Manager': 'parts_manager',
    'Service Advisor': 'service_advisor',
    'Technician': 'technician',
    'Reception': 'reception',
    'Other Staff': 'other_staff'
  };
  
  return roleMap[displayRoleName] || 'technician';
}

// Ensure the role value matches one of our expected app_role values
export function validateRoleValue(roleName: string): string {
  const validRoles = [
    'owner', 'admin', 'manager', 'parts_manager', 
    'service_advisor', 'technician', 'reception', 'other_staff'
  ];
  
  return validRoles.includes(roleName) ? roleName : 'technician';
}

// Detect the most likely role based on job title
export function detectRoleFromJobTitle(jobTitle: string): string | null {
  const normalizedTitle = jobTitle.toLowerCase();
  
  // Check each role's job titles
  for (const [role, titles] of Object.entries(roleJobTitleMap)) {
    for (const title of titles) {
      if (normalizedTitle.includes(title.toLowerCase())) {
        return role;
      }
    }
  }
  
  // Handle specific matches that might not be in the main list
  if (normalizedTitle.includes('owner') || normalizedTitle.includes('ceo') || normalizedTitle.includes('president')) {
    return 'Owner';
  }
  
  if (normalizedTitle.includes('admin') || normalizedTitle.includes('administrator')) {
    return 'Administrator';
  }
  
  if (normalizedTitle.includes('manager') || normalizedTitle.includes('supervisor') || normalizedTitle.includes('lead')) {
    return 'Manager';
  }
  
  if (normalizedTitle.includes('tech') || normalizedTitle.includes('mechanic')) {
    return 'Technician';
  }
  
  return null;
}
