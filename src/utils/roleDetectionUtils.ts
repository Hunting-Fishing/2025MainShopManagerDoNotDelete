
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
