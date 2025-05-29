
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  completedSteps: number[];
}

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>({
    isComplete: false,
    currentStep: 0,
    completedSteps: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get user's profile to find shop_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();

        if (!profile?.shop_id) {
          setLoading(false);
          return;
        }

        // Check shop onboarding status
        const { data: shop } = await supabase
          .from('shops')
          .select('onboarding_completed, setup_step')
          .eq('id', profile.shop_id)
          .single();

        // Check onboarding progress
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('shop_id', profile.shop_id)
          .single();

        const isComplete = shop?.onboarding_completed || progress?.is_completed || false;
        const currentStep = progress?.current_step || shop?.setup_step || 0;
        const completedSteps = progress?.completed_steps || [];

        setStatus({
          isComplete,
          currentStep,
          completedSteps
        });

      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to not completed on error
        setStatus({
          isComplete: false,
          currentStep: 0,
          completedSteps: []
        });
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return { status, loading };
}
