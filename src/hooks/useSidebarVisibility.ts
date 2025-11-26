import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';

export interface SidebarVisibilitySettings {
  hidden_sections: string[];
  section_roles: Record<string, string[]>;
}

export function useSidebarVisibilitySettings() {
  return useQuery({
    queryKey: ['sidebar-visibility'],
    queryFn: async () => {
      // Get current user's shop_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.shop_id) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .select('settings_value')
        .eq('shop_id', profile.shop_id)
        .eq('settings_key', 'sidebar_navigation')
        .maybeSingle();

      if (error) {
        console.error('Error fetching sidebar visibility settings:', error);
        return null;
      }

      if (!data?.settings_value) return null;

      // Type guard to ensure proper structure
      const value = data.settings_value as any;
      if (typeof value === 'object' && value !== null) {
        return {
          hidden_sections: Array.isArray(value.hidden_sections) ? value.hidden_sections : [],
          section_roles: typeof value.section_roles === 'object' ? value.section_roles : {},
        } as SidebarVisibilitySettings;
      }

      return null;
    },
  });
}

export function useUpdateSidebarVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SidebarVisibilitySettings) => {
      // Get current user's shop_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.shop_id) {
        throw new Error('No shop ID found');
      }

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          shop_id: profile.shop_id,
          settings_key: 'sidebar_navigation',
          settings_value: settings as any,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar-visibility'] });
    },
  });
}

export function useSidebarVisibility() {
  const { data: settings } = useSidebarVisibilitySettings();
  const { data: userRoles = [] } = useUserRoles();

  const isVisible = (sectionTitle: string): boolean => {
    // Check if section is hidden at shop level
    if (settings?.hidden_sections?.includes(sectionTitle)) {
      return false;
    }

    // Check role-based visibility
    const allowedRoles = settings?.section_roles?.[sectionTitle];
    if (allowedRoles && allowedRoles.length > 0) {
      // If there are allowed roles defined, user must have at least one
      return allowedRoles.some(role => userRoles.includes(role));
    }

    // If no restrictions, section is visible
    return true;
  };

  return {
    isVisible,
    settings,
    userRoles,
  };
}
