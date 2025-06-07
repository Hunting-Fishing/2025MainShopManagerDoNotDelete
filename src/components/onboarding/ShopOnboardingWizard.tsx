import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { BusinessSettingsStep } from './steps/BusinessSettingsStep';
import { useOnboardingRecovery } from '@/hooks/useOnboardingRecovery';
import { supabase } from '@/integrations/supabase/client';

interface ShopOnboardingWizardProps {
  onComplete?: () => void;
}

const steps = [
  { id: 'business-info', label: 'Business Information' },
  { id: 'business-settings', label: 'Business Settings' },
];

export function ShopOnboardingWizard({ onComplete }: ShopOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveDraft, loadDraft, clearDraft, recoverFromError, isRecovering } = useOnboardingRecovery();

  // Load draft data on mount
  useEffect(() => {
    const recoverData = async () => {
      try {
        const recoveredData = await recoverFromError();
        if (recoveredData) {
          setFormData(recoveredData.data || {});
          setCurrentStep(recoveredData.currentStep || 0);
          setCompletedSteps(recoveredData.completedSteps || []);
        }
      } catch (err: any) {
        console.error('Onboarding recovery failed:', err);
        toast({
          title: "Recovery Failed",
          description: err.message || "Failed to recover previous progress. Starting from the beginning.",
          variant: "destructive",
        });
      }
    };

    recoverData();
  }, [recoverFromError]);

  const nextStep = async () => {
    // Validate current step before proceeding
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    // Mark current step as complete
    const stepId = steps[currentStep].id;
    setCompletedSteps(prev => [...prev, stepId]);

    // Save progress to database
    await saveOnboardingProgress(stepId);

    // Move to the next step
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    // Add validation logic for each step here
    // Return true if valid, false otherwise
    switch (steps[stepIndex].id) {
      case 'business-info':
        // Example validation: Check if business name is not empty
        if (!formData.businessName) {
          toast({
            title: "Validation Error",
            description: "Business name is required.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'business-settings':
        // Example validation: Check if default tax rate is a number
        if (isNaN(formData.defaultTaxRate)) {
          toast({
            title: "Validation Error",
            description: "Default tax rate must be a number.",
            variant: "destructive",
          });
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const setFormValue = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    saveDraft({ ...formData, [field]: value }, currentStep);
  };

  const saveOnboardingProgress = async (completedStepId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get user's profile to find shop_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) {
        throw new Error('No shop associated with user');
      }

      // Check existing onboarding progress
      const { data: progress } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .maybeSingle();

      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('onboarding_progress')
          .update({
            current_step: currentStep + 1,
            completed_steps: [...completedSteps, completedStepId],
            step_data: formData,
            is_completed: currentStep + 1 === steps.length
          })
          .eq('shop_id', profile.shop_id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('onboarding_progress')
          .insert({
            shop_id: profile.shop_id,
            current_step: currentStep + 1,
            completed_steps: [completedStepId],
            step_data: formData,
            is_completed: currentStep + 1 === steps.length
          });

        if (error) throw error;
      }

      // If onboarding is complete, update shop record
      if (currentStep + 1 === steps.length) {
        const { error: shopError } = await supabase
          .from('shops')
          .update({ onboarding_completed: true, setup_step: 5 })
          .eq('id', profile.shop_id);

        if (shopError) throw shopError;
      }

      // Clear draft data
      clearDraft();

      // Call onComplete if provided
      if (currentStep + 1 === steps.length && onComplete) {
        onComplete();
      }

    } catch (err) {
      console.error('Error saving onboarding progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to save progress');
      toast({
        title: "Save Failed",
        description: "Couldn't save your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'business-info':
        return <BusinessInfoStep formData={formData} setFormValue={setFormValue} />;
      case 'business-settings':
        return <BusinessSettingsStep formData={formData} setFormValue={setFormValue} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const currentStepId = steps[currentStep].id;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Shop Setup Wizard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {completedSteps.includes(step.id) || index < currentStep ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span>{step.label}</span>
              {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400 ml-1" />}
            </div>
          ))}
        </div>

        {isRecovering ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading previous progress...</p>
          </div>
        ) : (
          renderStepContent()
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={nextStep} disabled={currentStep === steps.length - 1 || isSubmitting}>
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
