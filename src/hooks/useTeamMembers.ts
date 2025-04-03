
import { useState, useEffect } from 'react';
import { TeamMember } from "@/types/team";
import { supabase } from '@/integrations/supabase/client';

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get authenticated users from Supabase
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

        // Transform the profile data to match TeamMember type
        const mappedMembers: TeamMember[] = profiles.map(profile => {
          // Extract role information - handling potential data structure issues
          let userRole = 'User'; // Default role
          
          if (profile.user_roles && 
              Array.isArray(profile.user_roles) && 
              profile.user_roles.length > 0 && 
              profile.user_roles[0].roles) {
            // Check if roles is an object with a name property
            if (typeof profile.user_roles[0].roles === 'object' && 
                profile.user_roles[0].roles !== null &&
                'name' in profile.user_roles[0].roles) {
              userRole = profile.user_roles[0].roles.name || 'User';
            }
          }
          
          // Create a TeamMember object
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
            role: userRole,
            email: profile.email || '',
            phone: profile.phone || '',
            jobTitle: userRole, // Default to role name if no job title is available
            department: 'General', // Default department
            status: "Active", // Default status
            joinDate: profile.created_at,
            workOrders: {
              assigned: 0,
              completed: 0
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

  return { teamMembers, isLoading, error };
}
