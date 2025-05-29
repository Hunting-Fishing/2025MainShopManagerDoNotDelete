
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';
import { CompletionStep } from './steps/CompletionStep';
import { useShopData } from '@/hooks/useShopData';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface OnboardingData {
  // Basic Info
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  
  // Business Details
  taxId?: string;
  businessType?: string;
  industry?: string;
  otherIndustry?: string;
  
  // Business Hours
  businessHours?: any[];
}

const steps = [
  { id: 1, title: 'Basic Information', component: BasicInfoStep },
  { id: 2, title: 'Business Details', component: BusinessDetailsStep },
  { id: 3, title: 'Business Hours', component: BusinessHoursStep },
  { id: 4, title: 'Complete Setup', component: CompletionStep },
];

export function ShopOnboardingWizard() {
  const navigate = useNavigate();
  const { shopData, updateCompanyInfo, loading } = useShopData();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [completingSetup, setCompletingSetup] = useState(false);

  // Load existing data into form if available
  useEffect(() => {
    if (shopData && !loading) {
      setOnboardingData({
        name: shopData.name || '',
        email: shopData.email || '',
        phone: shopData.phone || '',
        address: shopData.address || '',
        city: shopData.city || '',
        state: shopData.state || '',
        zip: shopData.postal_code || '',
        taxId: shopData.tax_id || '',
        businessType: shopData.business_type || '',
        industry: shopData.industry || '',
        otherIndustry: shopData.other_industry || '',
      });
    }
  }, [shopData, loading]);

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!shopData?.id) {
      toast({
        title: "Error",
        description: "Shop information not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setCompletingSetup(true);

      // Update the shop record with onboarding completion
      const { error: shopError } = await supabase
        .from('shops')
        .update({
          onboarding_completed: true,
          setup_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopData.id);

      if (shopError) {
        throw shopError;
      }

      // Update or create onboarding progress record
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: shopData.id,
          current_step: 4,
          completed_steps: [1, 2, 3, 4],
          is_completed: true,
          step_data: onboardingData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shop_id'
        });

      if (progressError) {
        throw progressError;
      }

      toast({
        title: "Success!",
        description: "Shop setup completed successfully",
      });

      // Navigate to dashboard
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingSetup(false);
    }
  };

  const getCurrentStepComponent = () => {
    const StepComponent = steps[currentStep - 1].component;
    
    const commonProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      data: onboardingData,
      updateData,
    };

    // Only pass onComplete to the final step
    if (currentStep === steps.length) {
      return (
        <StepComponent 
          {...commonProps} 
          onComplete={handleComplete}
        />
      );
    }

    return <StepComponent {...commonProps} />;
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Setup</h1>
          <p className="text-gray-600">Let's get your shop configured and ready to go</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          
          <Progress value={progressPercentage} className="mb-6" />
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {completingSetup ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing setup...</p>
              </div>
            ) : (
              getCurrentStepComponent()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
