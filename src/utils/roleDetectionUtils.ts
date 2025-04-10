
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
 * Converts a role display name to its database value
 * @param roleName The display name of the role
 * @returns The database enum value for the role
 */
export function getRoleDbValue(roleName: string): string {
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

  // Check if the role is in our mapping
  if (roleName in roleMap) {
    return roleMap[roleName];
  }
  
  // If not, normalize the role name (convert to lowercase, replace spaces with underscores)
  const normalizedRole = roleName.toLowerCase().replace(/\s+/g, '_');
  
  // Return normalized or default to 'other_staff' if completely unknown
  return ['owner', 'admin', 'manager', 'parts_manager', 'service_advisor', 
         'technician', 'reception', 'other_staff'].includes(normalizedRole) 
    ? normalizedRole 
    : 'other_staff';
}
