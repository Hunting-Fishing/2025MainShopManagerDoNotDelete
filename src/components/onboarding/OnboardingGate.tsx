
import React from 'react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { ShopOnboardingWizard } from './ShopOnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { status, loading } = useOnboardingStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Show onboarding if not complete
  if (!status.isComplete) {
    return <ShopOnboardingWizard />;
  }

  // Show the main app if onboarding is complete
  return <>{children}</>;
}
