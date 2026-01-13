import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface WaterDeliveryStaffMember {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  roles: Array<{ id: string; name: string }>;
  has_auth_account: boolean;
  invitation_sent_at?: string;
  created_at: string;
}

export interface CreateStaffInput {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  role_id?: string;
  send_invitation?: boolean;
  password?: string;
}

export interface UpdateStaffInput {
  id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  department?: string;
}

// Water Delivery specific roles - includes universal roles (owner, admin, manager) 
// and module-specific roles tagged with 'water-delivery' module_slug
const WATER_DELIVERY_ROLE_NAMES = [
  'owner', 'admin', 'manager', // Universal roles
  'dispatch', 'truck_driver', 'operations_manager', 'yard_manager', // Water delivery specific
] as const;

export function useWaterDeliveryStaff() {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: ['water-delivery-staff', shopId],
    queryFn: async (): Promise<WaterDeliveryStaffMember[]> => {
      if (!shopId) return [];

      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          middle_name,
          email,
          phone,
          job_title,
          department,
          has_auth_account,
          invitation_sent_at,
          created_at
        `)
        .eq('shop_id', shopId)
        .order('first_name', { ascending: true });

      if (profilesError) {
        console.error('Error fetching staff profiles:', profilesError);
        throw profilesError;
      }

      // Fetch roles for each profile and filter by Water Delivery roles
      const staffWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              roles (
                id,
                name,
                module_slug
              )
            `)
            .eq('user_id', profile.id);

          const roles = (userRoles || [])
            .map((ur: any) => ur.roles)
            .filter(Boolean);

          return {
            ...profile,
            roles,
          } as WaterDeliveryStaffMember;
        })
      );

      // Filter to only show staff with Water Delivery roles or universal roles
      const waterDeliveryStaff = staffWithRoles.filter(staff => {
        if (staff.roles.length === 0) return false; // Hide staff with no roles
        return staff.roles.some(role => 
          (WATER_DELIVERY_ROLE_NAMES as readonly string[]).includes(role.name) || 
          (role as any).module_slug === 'water-delivery' ||
          (role as any).module_slug === null // Universal roles
        );
      });

      return waterDeliveryStaff;
    },
    enabled: !!shopId,
  });

  const createStaffMutation = useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      if (!shopId) throw new Error('Shop ID is required');

      // Create the profile first - id is required for profiles table
      const profileId = uuidv4();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          first_name: input.first_name,
          last_name: input.last_name,
          middle_name: input.middle_name,
          email: input.email,
          phone: input.phone,
          job_title: input.job_title,
          department: input.department,
          shop_id: shopId,
          has_auth_account: false,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      // Assign role if provided
      if (input.role_id && profile) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profile.id,
            role_id: input.role_id,
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          // Don't throw - profile was created successfully
        }
      }

      // Send invitation if requested
      if (input.send_invitation && profile) {
        const { error: inviteError } = await supabase.functions.invoke('invite-team-member', {
          body: {
            email: input.email,
            firstName: input.first_name,
            lastName: input.last_name,
            profileId: profile.id,
            roleId: input.role_id || '',
            shopId: shopId,
            password: input.password,
          },
        });

        if (inviteError) {
          console.error('Error sending invitation:', inviteError);
          // Don't throw - profile was created
          toast.warning('Staff created but invitation failed to send');
        }
      }

      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
      toast.success('Staff member created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating staff:', error);
      toast.error(error.message || 'Failed to create staff member');
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (input: UpdateStaffInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update staff member');
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ staffId, roleId }: { staffId: string; roleId: string }) => {
      // First remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', staffId);

      // Then assign new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: staffId,
          role_id: roleId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
      toast.success('Role assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign role');
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (staff: WaterDeliveryStaffMember) => {
      if (!shopId) throw new Error('Shop ID is required');

      const roleId = staff.roles[0]?.id || '';

      const { error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          email: staff.email,
          firstName: staff.first_name,
          lastName: staff.last_name,
          profileId: staff.id,
          roleId: roleId,
          shopId: shopId,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  // Note: Deactivation would require adding is_active column to profiles table
  // For now, we'll just delete the user_roles to effectively deactivate
  const deactivateStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      // Remove all roles to deactivate
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
      toast.success('Staff member deactivated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate staff member');
    },
  });

  const reactivateStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      // This would need a role to reactivate - for now just notify
      toast.info('Please assign a role to reactivate this staff member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-staff', shopId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reactivate staff member');
    },
  });

  return {
    staff: staffQuery.data || [],
    isLoading: staffQuery.isLoading,
    error: staffQuery.error,
    refetch: staffQuery.refetch,
    createStaff: createStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    updateStaff: updateStaffMutation.mutateAsync,
    isUpdating: updateStaffMutation.isPending,
    assignRole: assignRoleMutation.mutateAsync,
    isAssigningRole: assignRoleMutation.isPending,
    resendInvitation: resendInvitationMutation.mutateAsync,
    isResending: resendInvitationMutation.isPending,
    deactivateStaff: deactivateStaffMutation.mutateAsync,
    reactivateStaff: reactivateStaffMutation.mutateAsync,
  };
}

// Hook to fetch available roles for Water Delivery module
export function useAvailableRoles() {
  return useQuery({
    queryKey: ['available-roles', 'water-delivery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description, display_order, module_slug')
        .or('module_slug.eq.water-delivery,module_slug.is.null') // Water delivery specific or universal
        .in('name', WATER_DELIVERY_ROLE_NAMES)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
