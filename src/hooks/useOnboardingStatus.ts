
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface OnboardingStatus {
  isComplete: boolean;
  hasShopInfo: boolean;
  hasBusinessSettings: boolean;
  lastStep: number;
}

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>({
    isComplete: false,
    hasShopInfo: false,
    hasBusinessSettings: false,
    lastStep: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has shop info
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) {
        setStatus({
          isComplete: false,
          hasShopInfo: false,
          hasBusinessSettings: false,
          lastStep: 0,
        });
        return;
      }

      // Check shop details
      const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('id', profile.shop_id)
        .single();

      // Check business hours
      const { data: hours } = await supabase
        .from('shop_hours')
        .select('*')
        .eq('shop_id', profile.shop_id);

      const hasShopInfo = !!(shop?.name && shop?.address && shop?.phone && shop?.email);
      const hasBusinessSettings = hours && hours.length > 0;
      const isComplete = hasShopInfo && hasBusinessSettings;

      setStatus({
        isComplete,
        hasShopInfo,
        hasBusinessSettings,
        lastStep: isComplete ? 4 : hasBusinessSettings ? 2 : hasShopInfo ? 1 : 0,
      });

    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    setStatus(prev => ({ ...prev, isComplete: true, lastStep: 4 }));
  };

  return {
    status,
    loading,
    checkOnboardingStatus,
    markOnboardingComplete,
  };
}
