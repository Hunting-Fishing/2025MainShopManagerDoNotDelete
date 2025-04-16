
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface StaffMember {
  id: string;
  name: string;
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
        // First try the correct join approach
        let { data, error: fetchError } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            user_roles!left (
              role_id, 
              roles:role_id (
                name
              )
            )
          `);

        // If there's an error with the join, fall back to just fetching profiles
        if (fetchError) {
          console.error("Error with join query:", fetchError);
          console.log("Falling back to simple profiles query");
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name');
            
          if (profilesError) {
            console.error("Error fetching staff members:", profilesError);
            setError("Failed to load staff members");
            return;
          }
          
          // Add empty user_roles array to each profile in the fallback data
          data = profilesData?.map(profile => ({
            ...profile,
            user_roles: []
          }));
        }

        if (!data) {
          setStaffMembers([]);
          return;
        }

        // Transform the data to match StaffMember interface
        const formattedStaff = data.map(staff => {
          // Extract role from the nested user_roles data
          let role = 'No Role';
          
          if (staff.user_roles && 
              Array.isArray(staff.user_roles) && 
              staff.user_roles.length > 0 && 
              staff.user_roles[0]?.roles) {
            // Correctly access the role name
            const rolesData = staff.user_roles[0].roles;
            if (rolesData && 
                typeof rolesData === 'object' && 
                'name' in rolesData && 
                typeof rolesData.name === 'string') {
              role = rolesData.name;
            }
          }
          
          return {
            id: staff.id,
            name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
            role: role,
            first_name: staff.first_name,
            last_name: staff.last_name
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffMembers();
  }, [roleFilter]);

  return { staffMembers, isLoading, error };
}
