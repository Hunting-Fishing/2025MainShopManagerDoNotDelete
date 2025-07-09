import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useFetchUserRoles } from './team/useFetchUserRoles';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  roles?: Array<{
    id: string;
    name: string;
  }>;
}

export interface StaffStats {
  totalStaff: number;
  activeToday: number;
  onLeave: number;
  pendingReviews: number;
}

export function useStaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeToday: 0,
    onLeave: 0,
    pendingReviews: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserRoles } = useFetchUserRoles();

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all profiles (treating all as active since there's no is_active column)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          department,
          created_at,
          updated_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles for each profile
      const profileIds = profilesData?.map(p => p.id) || [];
      
      let rolesData: any[] = [];
      if (profileIds.length > 0) {
        try {
          rolesData = await fetchUserRoles();
        } catch (rolesError) {
          console.warn('Error fetching roles:', rolesError);
        }

        // Combine profiles with roles
        const staffWithRoles = profilesData?.map(profile => {
          const userRoles = rolesData
            ?.filter(role => role.user_id === profile.id)
            ?.map(role => role.roles)
            ?.filter(Boolean)
            ?.flat() || []; // Flatten the nested arrays
          
          return {
            ...profile,
            roles: userRoles as Array<{ id: string; name: string; }>
          };
        }) || [];

        setStaff(staffWithRoles);

        // Calculate stats (treating all profiles as active)
        const totalStaff = staffWithRoles.length;
        const activeToday = staffWithRoles.length; // All are considered active
        const onLeave = 0; // TODO: Implement leave tracking
        const pendingReviews = 0; // TODO: Implement review tracking

        setStats({
          totalStaff,
          activeToday,
          onLeave,
          pendingReviews
        });
      } else {
        setStaff([]);
        setStats({
          totalStaff: 0,
          activeToday: 0,
          onLeave: 0,
          pendingReviews: 0
        });
      }

    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch staff'));
      toast.error('Failed to load staff members');
    } finally {
      setIsLoading(false);
    }
  };

  const addStaffMember = async (staffData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    job_title?: string;
    department?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([staffData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Staff member added successfully');
      await fetchStaff(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error adding staff member:', err);
      toast.error('Failed to add staff member');
      throw err;
    }
  };

  const updateStaffMember = async (id: string, updates: Partial<StaffMember>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Staff member updated successfully');
      await fetchStaff(); // Refresh the list
    } catch (err) {
      console.error('Error updating staff member:', err);
      toast.error('Failed to update staff member');
      throw err;
    }
  };

  const removeStaffMember = async (id: string) => {
    try {
      // Since there's no is_active column, we'll delete the profile entirely
      // In a production system, you might want to add an is_active column
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Staff member removed successfully');
      await fetchStaff(); // Refresh the list
    } catch (err) {
      console.error('Error removing staff member:', err);
      toast.error('Failed to remove staff member');
      throw err;
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    stats,
    isLoading,
    error,
    fetchStaff,
    addStaffMember,
    updateStaffMember,
    removeStaffMember
  };
}