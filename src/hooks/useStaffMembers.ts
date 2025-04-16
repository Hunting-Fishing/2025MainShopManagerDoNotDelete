
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/utils/errorHandling';

export interface StaffMember {
  id: string;
  name?: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export function useStaffMembers(roleFilter?: string) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from the team_members table
        let { data, error: fetchError } = await supabase
          .from('team_members')
          .select(`
            id, 
            first_name, 
            last_name, 
            team_member_roles!left (
              role_id, 
              roles:role_id (
                name
              )
            )
          `);

        // If there's an error or no data, try to fall back to profiles
        if (fetchError || !data || data.length === 0) {
          console.warn("Team members table error or empty, falling back to profiles:", fetchError);
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name');
            
          if (profilesError) {
            console.error("Error fetching staff members:", profilesError);
            setError("Failed to load staff members");
            return;
          }
          
          // Add empty team_member_roles array to each profile in the fallback data
          data = profilesData?.map(profile => ({
            ...profile,
            team_member_roles: []
          })) || [];
        }

        if (data.length === 0) {
          setStaffMembers([]);
          return;
        }

        // Transform the data to match StaffMember interface
        const formattedStaff = data.map(staff => {
          // Extract role from the nested team_member_roles data
          let role = 'No Role';
          
          if (staff.team_member_roles && 
              Array.isArray(staff.team_member_roles) && 
              staff.team_member_roles.length > 0 && 
              staff.team_member_roles[0]?.roles) {
            // Correctly access the role name
            const rolesData = staff.team_member_roles[0].roles;
            if (rolesData && 
                typeof rolesData === 'object' && 
                'name' in rolesData && 
                typeof rolesData.name === 'string') {
              role = rolesData.name;
            }
          }
          
          // Create a full name from first and last name
          const name = `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unnamed';
          
          return {
            id: staff.id,
            name: name,
            first_name: staff.first_name,
            last_name: staff.last_name,
            role: role
          };
        });

        // Filter by role if specified
        const filteredStaff = roleFilter 
          ? formattedStaff.filter(staff => 
              staff.role.toLowerCase().includes(roleFilter.toLowerCase()))
          : formattedStaff;
        
        setStaffMembers(filteredStaff);
        console.log("Fetched staff members:", filteredStaff);
      } catch (err) {
        console.error("Error in fetchStaffMembers:", err);
        setError("An unexpected error occurred");
        handleApiError(err, "Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffMembers();
  }, [roleFilter]);

  return { staffMembers, isLoading, error };
}
