
import { useState, useEffect } from 'react';
import { TeamMember } from "@/types/team";
import { supabase } from "@/lib/supabase";

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, fetch all profiles from Supabase to include users that may not have assigned roles yet
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            job_title,
            department,
            created_at
          `);

        if (profilesError) {
          throw profilesError;
        }

        // Then fetch user_roles to identify who has assigned roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role_id,
            roles:role_id(
              id,
              name
            )
          `);
          
        if (rolesError) {
          console.warn("Error fetching user roles:", rolesError);
          // Continue without roles data, we'll show users without roles assigned
        }

        // Get work order data for technicians
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select('technician_id, status');
          
        if (workOrderError) {
          console.warn('Error fetching work orders:', workOrderError);
          // Continue without work order data
        }

        // Transform the profile data to match TeamMember type
        const mappedMembers: TeamMember[] = profiles.map(profile => {
          // Extract role information - default to "No Role" if no role is assigned
          let userRole = 'No Role Assigned'; // Default for users without roles
          
          if (userRoles && userRoles.length > 0) {
            const userRoleData = userRoles.find(ur => ur.user_id === profile.id);
            
            if (userRoleData && 
                userRoleData.roles && 
                typeof userRoleData.roles === 'object' && 
                userRoleData.roles !== null &&
                'name' in userRoleData.roles) {
              // Map the database role value to a display name
              const dbRoleName = userRoleData.roles.name as string; // Add type assertion here
              // Convert database role names to display names
              if (dbRoleName === 'owner') {
                userRole = 'Owner';
              } else if (dbRoleName === 'admin') {
                userRole = 'Administrator';
              } else if (dbRoleName === 'technician') {
                userRole = 'Technician';
              } else if (dbRoleName === 'reception') {
                userRole = 'Customer Service';
              } else if (dbRoleName === 'manager') {
                userRole = 'Manager';
              } else if (dbRoleName === 'parts_manager') {
                userRole = 'Parts Manager';
              } else if (dbRoleName === 'service_advisor') {
                userRole = 'Service Advisor';
              } else if (dbRoleName === 'other_staff') {
                userRole = 'Other Staff';
              } else {
                // Capitalize the first letter of other roles
                userRole = dbRoleName.charAt(0).toUpperCase() + dbRoleName.slice(1);
              }
            }
          }

          // Count work orders for technicians
          let assignedWorkOrders = 0;
          let completedWorkOrders = 0;
          
          if (workOrderData && userRole === 'Technician') {
            assignedWorkOrders = workOrderData.filter(wo => 
              wo.technician_id === profile.id && 
              ['assigned', 'in_progress'].includes(wo.status)
            ).length;
            
            completedWorkOrders = workOrderData.filter(wo => 
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
          
          // Create a TeamMember object
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
            role: userRole,
            email: profile.email || '',
            phone: profile.phone || '',
            jobTitle: profile.job_title || determineJobTitle(userRole, profile.first_name), 
            department: department,
            status: "Active", // Default status - could be stored in profile
            joinDate: profile.created_at,
            workOrders: {
              assigned: assignedWorkOrders,
              completed: completedWorkOrders
            }
          };
        });

        // Log team member roles for debugging
        console.log('Team members with roles:', mappedMembers.map(member => ({
          name: member.name,
          role: member.role
        })));

        setTeamMembers(mappedMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members. Please try again later.');
        
        // If we can't fetch from Supabase, use data from teamData.ts as fallback
        const { teamMembers: mockMembers } = await import('@/data/teamData');
        setTeamMembers(mockMembers);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  // Helper function to determine job title based on role
  function determineJobTitle(role: string, firstName?: string): string {
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
  }

  return { teamMembers, isLoading, error };
}
