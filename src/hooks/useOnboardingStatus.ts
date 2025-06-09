
import { useState, useEffect } from 'react';

interface OnboardingStatus {
  isComplete: boolean;
  currentStep?: string;
}

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>({ isComplete: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // For now, consider onboarding complete
    // This can be enhanced later with actual onboarding logic
    setStatus({ isComplete: true });
    setLoading(false);
  }, []);

  return { status, loading };
}
