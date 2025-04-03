
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
        // Fetch team members from Supabase
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            user_roles:user_roles(
              role_id,
              roles:role_id(name)
            )
          `);

        if (profilesError) {
          throw profilesError;
        }

        if (!profiles || profiles.length === 0) {
          setTeamMembers([]);
          return;
        }

        // Get work order data for technicians
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select('technician_id, status');
          
        if (workOrderError) {
          console.error('Error fetching work orders:', workOrderError);
          // Continue without work order data
        }

        // Transform the profile data to match TeamMember type
        const mappedMembers: TeamMember[] = profiles.map(profile => {
          // Extract role information - handling potential data structure issues
          let userRole = 'User'; // Default role
          
          if (profile.user_roles && 
              Array.isArray(profile.user_roles) && 
              profile.user_roles.length > 0 && 
              profile.user_roles[0].roles) {
            if (typeof profile.user_roles[0].roles === 'object' && 
                profile.user_roles[0].roles !== null &&
                'name' in profile.user_roles[0].roles) {
              userRole = profile.user_roles[0].roles.name || 'User';
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
          let department = 'General';
          if (userRole === 'Technician') {
            department = 'Field Service';
          } else if (userRole === 'Owner' || userRole === 'Administrator') {
            department = 'Management';
          } else if (userRole === 'Customer Service') {
            department = 'Customer Support';
          }
          
          // Create a TeamMember object
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
            role: userRole,
            email: profile.email || '',
            phone: profile.phone || '',
            jobTitle: determineJobTitle(userRole, profile.first_name), 
            department: department,
            status: "Active", // Default status - could be stored in profile
            joinDate: profile.created_at,
            workOrders: {
              assigned: assignedWorkOrders,
              completed: completedWorkOrders
            }
          };
        });

        setTeamMembers(mappedMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
        setTeamMembers([]);
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
      default:
        return role;
    }
  }

  return { teamMembers, isLoading, error };
}
