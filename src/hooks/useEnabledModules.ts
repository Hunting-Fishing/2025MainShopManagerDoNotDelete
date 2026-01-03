import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

export interface BusinessModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string;
  is_premium: boolean;
  default_enabled: boolean;
  related_industries: string[] | null;
  display_order: number;
}

export interface EnabledModule {
  id: string;
  shop_id: string;
  module_id: string;
  enabled_at: string;
  enabled_by: string | null;
}

export function useBusinessModules() {
  return useQuery({
    queryKey: ['business-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_modules')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as BusinessModule[];
    },
  });
}

export function useShopEnabledModules() {
  const { user } = useAuthUser();

  return useQuery({
    queryKey: ['shop-enabled-modules', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('shop_enabled_modules')
        .select('*');

      if (error) throw error;
      return data as EnabledModule[];
    },
    enabled: !!user,
  });
}

export function useToggleModule() {
  const queryClient = useQueryClient();
  const { user } = useAuthUser();

  return useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      // Get user's shop_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (!profile?.shop_id) throw new Error('No shop found');

      if (enabled) {
        const { error } = await supabase
          .from('shop_enabled_modules')
          .insert({
            shop_id: profile.shop_id,
            module_id: moduleId,
            enabled_by: user.id,
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shop_enabled_modules')
          .delete()
          .eq('shop_id', profile.shop_id)
          .eq('module_id', moduleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-enabled-modules'] });
    },
  });
}

export function useEnabledModules() {
  const { data: modules = [] } = useBusinessModules();
  const { data: enabledModules = [] } = useShopEnabledModules();

  const enabledModuleIds = new Set(enabledModules.map(em => em.module_id));

  const isModuleEnabled = (moduleSlug: string): boolean => {
    const module = modules.find(m => m.slug === moduleSlug);
    if (!module) return true; // If module not found, don't hide anything

    // If explicitly enabled
    if (enabledModuleIds.has(module.id)) return true;

    // If default enabled and not explicitly disabled (no record means use default)
    if (module.default_enabled && enabledModules.length === 0) return true;
    if (module.default_enabled && enabledModuleIds.has(module.id)) return true;

    // Check if there are any enabled modules at all - if not, use defaults
    if (enabledModules.length === 0) return module.default_enabled;

    return false;
  };

  const getEnabledModuleSlugs = (): string[] => {
    if (enabledModules.length === 0) {
      // Use defaults
      return modules.filter(m => m.default_enabled).map(m => m.slug);
    }
    return modules
      .filter(m => enabledModuleIds.has(m.id))
      .map(m => m.slug);
  };

  return {
    modules,
    enabledModules,
    isModuleEnabled,
    getEnabledModuleSlugs,
    isLoading: modules.length === 0,
  };
}
