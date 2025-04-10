import { TeamMember } from "@/types/team";
import { Profile } from "./useFetchProfiles";
import { UserRole } from "./useFetchUserRoles";
import { WorkOrder } from "./useFetchWorkOrders";

/**
 * Hook that transforms raw data from different sources into TeamMember objects
 */
export function useTeamDataTransformer() {
  // Helper function to map database role names to display names
  const mapRoleName = (dbRoleName: string): string => {
    const roleMap: Record<string, string> = {
      'owner': 'Owner',
      'admin': 'Administrator',
      'technician': 'Technician',
      'reception': 'Customer Service',
      'manager': 'Manager',
      'parts_manager': 'Parts Manager',
      'service_advisor': 'Service Advisor',
      'other_staff': 'Other Staff'
    };

    return roleMap[dbRoleName] || 
      // Capitalize first letter of other roles
      (dbRoleName.charAt(0).toUpperCase() + dbRoleName.slice(1));
  };

  // Helper function to determine job title based on role and profile data
  const determineJobTitle = (role: string, jobTitle: string | null, firstName?: string): string => {
    // If job title is provided in the profile, use it
    if (jobTitle) return jobTitle;
    
    // Otherwise determine based on role
    switch (role) {
      case 'Owner':
        return 'Chief Executive Officer';
      case 'Administrator':
        return 'Office Administrator';
      case 'Technician':
        return `${firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Senior'} Technician`;
      case 'Customer Service':
        return 'Customer Service Representative';
      case 'No Role Assigned':
        return 'New User';
      default:
        return role;
    }
  };

  // Helper function to determine department based on role and profile data
  const determineDepartment = (department: string | null, role: string): string => {
    // If department is provided in the profile, use it
    if (department) return department;
    
    // Otherwise determine based on role
    if (role === 'Technician') {
      return 'Field Service';
    } else if (role === 'Owner' || role === 'Administrator') {
      return 'Management';
    } else if (role === 'Customer Service') {
      return 'Customer Support';
    } else if (role === 'Service Advisor') {
      return 'Service Department';
    } else if (role === 'Parts Manager') {
      return 'Parts';
    } else {
      return 'General';
    }
  };

  const transformData = (
    profiles: Profile[],
    userRoles: UserRole[],
    workOrders: WorkOrder[]
  ): TeamMember[] => {
    return profiles.map(profile => {
      // Find user role if it exists
      const userRoleData = userRoles.find(ur => ur.user_id === profile.id);
      
      // Determine role name with fallback to "No Role Assigned"
      let userRole = 'No Role Assigned';
      
      if (userRoleData?.roles && 
          typeof userRoleData.roles === 'object' && 
          userRoleData.roles !== null &&
          'name' in userRoleData.roles) {
        // Map the database role to a display name
        const dbRoleName = userRoleData.roles.name as string;
        userRole = mapRoleName(dbRoleName);
      }

      // Count work orders for technicians
      let assignedWorkOrders = 0;
      let completedWorkOrders = 0;
      
      if (workOrders.length > 0) {
        assignedWorkOrders = workOrders.filter(wo => 
          wo.technician_id === profile.id && 
          ['assigned', 'in_progress'].includes(wo.status)
        ).length;
        
        completedWorkOrders = workOrders.filter(wo => 
          wo.technician_id === profile.id && 
          wo.status === 'completed'
        ).length;
      }
      
      // Determine department based on profile data and role
      const department = determineDepartment(profile.department, userRole);
      
      // Create and return a TeamMember object
      return {
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
        role: userRole,
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: determineJobTitle(userRole, profile.job_title, profile.first_name), 
        department: department,
        status: profile.is_active ? "Active" : "Inactive", // Default status from profile
        joinDate: profile.created_at,
        workOrders: {
          assigned: assignedWorkOrders,
          completed: completedWorkOrders
        }
      };
    });
  };

  return {
    transformData
  };
}
