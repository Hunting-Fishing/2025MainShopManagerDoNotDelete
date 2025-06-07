
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';
import { CompletionStep } from './steps/CompletionStep';
import { supabase } from '@/lib/supabase';
import { ErrorHandler } from '@/utils/errorHandler';
import { OnboardingError, ErrorType, ErrorSeverity, ERROR_CODES } from '@/utils/errorTypes';
import { useOnboardingValidation } from '@/hooks/useOnboardingValidation';
import { useOnboardingRecovery } from '@/hooks/useOnboardingRecovery';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const STEPS = [
  { title: 'Basic Information', component: BasicInfoStep },
  { title: 'Business Details', component: BusinessDetailsStep },
  { title: 'Business Hours', component: BusinessHoursStep },
  { title: 'Complete Setup', component: CompletionStep }
];

export interface OnboardingData {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  
  // Business Details
  taxId: string;
  businessType: string;
  industry: string;
  otherIndustry: string;
  
  // Business Hours
  businessHours?: any[];
  
  // Logo
  logoUrl?: string;
}

export function ShopOnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    taxId: '',
    businessType: '',
    industry: '',
    otherIndustry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { validateStep } = useOnboardingValidation();
  const { saveDraft, clearDraft, recoverFromError, hasDraftData, isRecovering } = useOnboardingRecovery();

  // Auto-save draft data
  useEffect(() => {
    if (Object.values(onboardingData).some(value => value !== '')) {
      saveDraft(onboardingData, currentStep);
    }
  }, [onboardingData, currentStep, saveDraft]);

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecovery = async () => {
      if (hasDraftData) {
        try {
          const recoveryData = await recoverFromError();
          if (recoveryData) {
            setOnboardingData(recoveryData.data || onboardingData);
            setCurrentStep(recoveryData.currentStep || 0);
            setCompletedSteps(recoveryData.completedSteps || []);
          }
        } catch (error) {
          const processedError = ErrorHandler.handleError(error);
          setError(processedError);
        }
      }
    };

    checkRecovery();
  }, [hasDraftData]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
    setError(null); // Clear any previous errors when data is updated
  };

  const handleNext = async () => {
    try {
      setError(null);
      
      // Validate current step
      const validation = validateStep(currentStep, onboardingData);
      if (!validation.isValid) {
        return;
      }

      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      // Save progress to database with retry logic
      await saveProgressWithRetry();

      // Move to next step
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      const processedError = ErrorHandler.handleError(error, { 
        context: 'onboarding_next_step',
        currentStep,
        data: onboardingData 
      });
      setError(processedError);
      ErrorHandler.showUserError(processedError);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  };

  const saveProgressWithRetry = async () => {
    return ErrorHandler.retryOperation(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new OnboardingError(
          ErrorType.AUTHENTICATION,
          ErrorSeverity.CRITICAL,
          ERROR_CODES.UNAUTHORIZED,
          'No authenticated user',
          'Please log in to continue'
        );
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) {
        throw new OnboardingError(
          ErrorType.DATABASE,
          ErrorSeverity.CRITICAL,
          'NO_SHOP_ID',
          'No shop ID found in profile',
          'There was an issue with your account setup. Please contact support.'
        );
      }

      // Use upsert to handle existing records
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: profile.shop_id,
          current_step: currentStep + 1,
          completed_steps: [...completedSteps, currentStep],
          step_data: onboardingData as any,
          is_completed: currentStep === STEPS.length - 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shop_id'
        });

      if (error) {
        throw error;
      }
    }, 3, 1000, { operation: 'save_progress' });
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      await ErrorHandler.retryOperation(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new OnboardingError(
            ErrorType.AUTHENTICATION,
            ErrorSeverity.CRITICAL,
            ERROR_CODES.UNAUTHORIZED,
            'No authenticated user',
            'Please log in to complete setup'
          );
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();

        if (!profile?.shop_id) {
          throw new OnboardingError(
            ErrorType.DATABASE,
            ErrorSeverity.CRITICAL,
            'NO_SHOP_ID',
            'No shop ID found',
            'Account setup issue. Please contact support.'
          );
        }

        // Update shop as completed
        const { error: shopError } = await supabase
          .from('shops')
          .update({ 
            onboarding_completed: true,
            setup_step: STEPS.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.shop_id);

        if (shopError) throw shopError;

        // Mark onboarding progress as completed
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert({
            shop_id: profile.shop_id,
            current_step: STEPS.length,
            completed_steps: [...Array(STEPS.length).keys()],
            step_data: onboardingData as any,
            is_completed: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'shop_id'
          });

        if (progressError) throw progressError;
      }, 3, 1000, { operation: 'complete_onboarding' });

      // Clear draft data on successful completion
      clearDraft();
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (error) {
      const processedError = ErrorHandler.handleError(error, { 
        context: 'onboarding_completion' 
      });
      setError(processedError);
      ErrorHandler.showUserError(processedError);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    if (currentStep === STEPS.length - 1) {
      await handleComplete();
    } else {
      await handleNext();
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" text="Recovering your progress..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Shop Setup - {STEPS[currentStep].title}
          </CardTitle>
          <div className="w-full mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Step {currentStep + 1} of {STEPS.length}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error.userMessage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-4"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <CurrentStepComponent
            onNext={currentStep === STEPS.length - 1 ? handleComplete : handleNext}
            onPrevious={handlePrevious}
            data={onboardingData}
            updateData={updateData}
            onComplete={handleComplete}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
