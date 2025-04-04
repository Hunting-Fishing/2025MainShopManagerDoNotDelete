
import { roleValueMapping } from '@/components/team/form/formConstants';
import { AppRole } from '@/utils/roleUtils';

/**
 * Maps common job titles to their corresponding roles
 */
const jobTitleToRoleMap: Record<string, string> = {
  // Owner roles
  "Business Owner": "Owner",
  "CEO": "Owner",
  "President": "Owner",
  "Managing Director": "Owner",
  
  // Admin roles
  "Office Manager": "Administrator",
  "Administrative Assistant": "Administrator", 
  "Operations Manager": "Administrator",
  "Shop Manager": "Administrator",
  "General Manager": "Administrator",
  
  // Manager roles
  "Manager": "Manager",
  "Department Manager": "Manager",
  "Team Lead": "Manager",
  "Supervisor": "Manager",
  
  // Parts Manager roles
  "Parts Manager": "Parts Manager",
  "Parts Department Head": "Parts Manager",
  "Inventory Manager": "Parts Manager",
  "Parts Specialist": "Parts Manager",
  
  // Service Advisor roles
  "Service Advisor": "Service Advisor",
  "Service Consultant": "Service Advisor",
  "Service Writer": "Service Advisor",
  "Customer Service Representative": "Service Advisor",
  
  // Technician roles
  "Technician": "Technician",
  "Senior Technician": "Technician",
  "Lead Technician": "Technician",
  "Master Technician": "Technician",
  "Apprentice": "Technician",
  "Mechanic": "Technician",
  "Diagnostic Specialist": "Technician",
  
  // Reception roles
  "Receptionist": "Reception",
  "Front Desk Coordinator": "Reception",
  "Customer Care Specialist": "Reception",
  "Front Office Assistant": "Reception",
  
  // Default to Other Staff for unknown titles
  "Staff": "Other Staff",
  "Associate": "Other Staff",
  "Assistant": "Other Staff"
};

/**
 * Detects the appropriate role based on job title
 * @param jobTitle The job title to map to a role
 * @returns The detected role name or null if no match found
 */
export const detectRoleFromJobTitle = (jobTitle: string | undefined | null): string | null => {
  if (!jobTitle) return null;
  
  // First check for exact match
  if (jobTitle in jobTitleToRoleMap) {
    return jobTitleToRoleMap[jobTitle];
  }
  
  // Then check for partial matches (case insensitive)
  const normalizedTitle = jobTitle.toLowerCase();
  
  // Check each job title for a partial match
  for (const [mappedTitle, role] of Object.entries(jobTitleToRoleMap)) {
    if (normalizedTitle.includes(mappedTitle.toLowerCase())) {
      return role;
    }
  }
  
  // Check if any role name appears directly in the job title
  for (const roleName of Object.keys(roleValueMapping)) {
    if (normalizedTitle.includes(roleName.toLowerCase())) {
      return roleName;
    }
  }
  
  // Default to Other Staff if no match found
  return "Other Staff";
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
 * Uses the existing roleValueMapping from formConstants
 */
export const getRoleDbValue = (roleName: string): AppRole => {
  // First check if it's in our mapping
  if (roleName in roleValueMapping) {
    return roleValueMapping[roleName] as AppRole;
  }
  
  // If not, validate and normalize the role name
  return validateRoleName(roleName);
};
