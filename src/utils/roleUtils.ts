
import { roleValueMapping } from '@/components/team/form/formConstants';

/**
 * Converts a display role name to the database role value
 */
export function mapRoleToDbValue(displayRole: string): string {
  return roleValueMapping[displayRole] || displayRole.toLowerCase().replace(/\s+/g, '_');
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
