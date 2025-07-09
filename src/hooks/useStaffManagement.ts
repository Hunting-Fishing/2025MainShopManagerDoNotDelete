import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  is_active: boolean;
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

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch profiles with their roles
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
          is_active,
          created_at,
          updated_at
        `)
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Fetch user roles for each profile
      const profileIds = profilesData?.map(p => p.id) || [];
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles:role_id(
            id,
            name
          )
        `)
        .in('user_id', profileIds);

      if (rolesError) {
        console.warn('Error fetching roles:', rolesError);
      }

      // Combine profiles with roles
      const staffWithRoles = profilesData?.map(profile => ({
        ...profile,
        roles: rolesData
          ?.filter(role => role.user_id === profile.id)
          ?.map(role => role.roles)
          ?.filter(Boolean)
          ?.flat() || []
      })) || [];

      setStaff(staffWithRoles);

      // Calculate stats
      const totalStaff = staffWithRoles.length;
      const activeToday = staffWithRoles.filter(s => s.is_active).length;
      const onLeave = 0; // TODO: Implement leave tracking
      const pendingReviews = 0; // TODO: Implement review tracking

      setStats({
        totalStaff,
        activeToday,
        onLeave,
        pendingReviews
      });

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
        .insert([{
          ...staffData,
          is_active: true
        }])
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
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
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