import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';
import { MODULE_CONFIGS } from '@/config/moduleSubscriptions';
import { toast } from 'sonner';

export interface ModuleSubscription {
  module_slug: string;
  subscription_id: string;
  current_period_end: string;
  status: string;
}

export interface ModuleSubscriptionStatus {
  subscriptions: ModuleSubscription[];
  trial_active: boolean;
  trial_ends_at: string | null;
}

export function useModuleSubscriptions() {
  const { user } = useAuthUser();

  return useQuery({
    queryKey: ['module-subscriptions', user?.id],
    queryFn: async (): Promise<ModuleSubscriptionStatus> => {
      const { data, error } = await supabase.functions.invoke('check-module-subscriptions');
      
      if (error) throw error;
      return data as ModuleSubscriptionStatus;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useSubscribeToModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleSlug: string) => {
      const config = MODULE_CONFIGS[moduleSlug];
      if (!config) throw new Error('Module not found');

      const { data, error } = await supabase.functions.invoke('create-module-checkout', {
        body: {
          moduleSlug,
          priceId: config.stripePriceId,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-subscriptions'] });
    },
    onError: (error) => {
      toast.error('Failed to start checkout: ' + error.message);
    },
  });
}

export function useModuleAccess() {
  const { data: subscriptionStatus, isLoading } = useModuleSubscriptions();

  const hasModuleAccess = (moduleSlug: string): boolean => {
    if (!subscriptionStatus) return false;
    
    // Trial is active - grant access to all modules
    if (subscriptionStatus.trial_active) return true;
    
    // Check for active subscription
    return subscriptionStatus.subscriptions.some(
      sub => sub.module_slug === moduleSlug && sub.status === 'active'
    );
  };

  const getSubscriptionForModule = (moduleSlug: string): ModuleSubscription | undefined => {
    return subscriptionStatus?.subscriptions.find(sub => sub.module_slug === moduleSlug);
  };

  return {
    hasModuleAccess,
    getSubscriptionForModule,
    trialActive: subscriptionStatus?.trial_active ?? false,
    trialEndsAt: subscriptionStatus?.trial_ends_at ?? null,
    subscriptions: subscriptionStatus?.subscriptions ?? [],
    isLoading,
  };
}
