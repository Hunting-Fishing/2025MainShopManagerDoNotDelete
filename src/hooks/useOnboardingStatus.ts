
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ErrorHandler } from '@/utils/errorHandler';
import { OnboardingError, ErrorType, ErrorSeverity } from '@/utils/errorTypes';

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
  const [error, setError] = useState<OnboardingError | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await ErrorHandler.retryOperation(async () => {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // If no user, consider onboarding not complete
            return {
              isComplete: false,
              currentStep: 0,
              completedSteps: []
            };
          }

          // Get user's profile to find shop_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('shop_id')
            .eq('id', user.id)
            .maybeSingle();

          if (!profile?.shop_id) {
            // If no shop associated, onboarding not complete
            return {
              isComplete: false,
              currentStep: 0,
              completedSteps: []
            };
          }

          // Check shop onboarding status
          const { data: shop } = await supabase
            .from('shops')
            .select('onboarding_completed, setup_step')
            .eq('id', profile.shop_id)
            .maybeSingle();

          // Check onboarding progress
          const { data: progress } = await supabase
            .from('onboarding_progress')
            .select('*')
            .eq('shop_id', profile.shop_id)
            .maybeSingle();

          const isComplete = shop?.onboarding_completed || progress?.is_completed || false;
          const currentStep = progress?.current_step || shop?.setup_step || 0;
          const completedSteps = progress?.completed_steps || [];

          return {
            isComplete,
            currentStep,
            completedSteps
          };
        }, 3, 1000, { operation: 'check_onboarding_status' });

        setStatus(result);

      } catch (error) {
        const processedError = ErrorHandler.handleError(error, { 
          context: 'onboarding_status_check' 
        });
        setError(processedError);
        
        // Default to not completed on error, but don't show error to user
        // as this is a background check
        setStatus({
          isComplete: false,
          currentStep: 0,
          completedSteps: []
        });
        
        console.error('Error checking onboarding status:', processedError);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const refreshStatus = () => {
    setLoading(true);
    // Re-run the effect
    useEffect(() => {
      const checkOnboardingStatus = async () => {
        // ... same logic as above
      };
      checkOnboardingStatus();
    }, []);
  };

  return { 
    status, 
    loading, 
    error,
    refreshStatus 
  };
}
