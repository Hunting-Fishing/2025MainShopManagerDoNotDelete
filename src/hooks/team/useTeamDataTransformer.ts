
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

  // Helper function to determine job title based on role
  const determineJobTitle = (role: string, firstName?: string): string => {
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
      
      if (workOrders.length > 0 && userRole === 'Technician') {
        assignedWorkOrders = workOrders.filter(wo => 
          wo.technician_id === profile.id && 
          ['assigned', 'in_progress'].includes(wo.status)
        ).length;
        
        completedWorkOrders = workOrders.filter(wo => 
          wo.technician_id === profile.id && 
          wo.status === 'completed'
        ).length;
      }
      
      // Determine department based on role
      let department = profile.department || 'General';
      if (!department && userRole === 'Technician') {
        department = 'Field Service';
      } else if (!department && (userRole === 'Owner' || userRole === 'Administrator')) {
        department = 'Management';
      } else if (!department && userRole === 'Customer Service') {
        department = 'Customer Support';
      }
      
      // Create and return a TeamMember object
      return {
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
        role: userRole,
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || determineJobTitle(userRole, profile.first_name), 
        department: department,
        status: "Active", // Default status
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
