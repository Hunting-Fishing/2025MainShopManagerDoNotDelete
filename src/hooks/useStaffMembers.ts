
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
        let query = supabase
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

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching staff members:", fetchError);
          setError("Failed to load staff members");
          return;
        }

        if (!data) {
          setStaffMembers([]);
          return;
        }

        // Transform the data to match StaffMember interface
        const formattedStaff = data.map(staff => {
          // Extract role from the nested user_roles data
          let role = 'No Role';
          
          if (staff.user_roles && staff.user_roles.length > 0 && 
              staff.user_roles[0].roles && staff.user_roles[0].roles.name) {
            role = staff.user_roles[0].roles.name;
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
