
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useShopData } from '@/hooks/useShopData';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Import step components
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';
import { CompletionStep } from './steps/CompletionStep';

export function ShopOnboardingWizard() {
  const navigate = useNavigate();
  const { status, loading, markOnboardingComplete } = useOnboardingStatus();
  const { shopData } = useShopData();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (!loading && status.isComplete) {
      navigate('/', { replace: true });
    }
  }, [status.isComplete, loading, navigate]);

  // Set initial step based on onboarding progress
  useEffect(() => {
    if (!loading && status) {
      if (!status.hasShopInfo) {
        setCurrentStep(0);
      } else if (!status.hasBusinessSettings) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
  }, [status, loading]);

  const steps = [
    { title: 'Basic Information', component: BasicInfoStep },
    { title: 'Business Details', component: BusinessDetailsStep },
    { title: 'Business Hours', component: BusinessHoursStep },
    { title: 'Complete Setup', component: CompletionStep }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as complete in database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (profile?.shop_id) {
        // Update shop to mark onboarding complete
        await supabase
          .from('shops')
          .update({ 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.shop_id);

        // Update onboarding progress
        await supabase
          .from('onboarding_progress')
          .upsert({
            shop_id: profile.shop_id,
            current_step: 4,
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        markOnboardingComplete();
        
        toast({
          title: "Setup Complete!",
          description: "Welcome to your shop management system",
        });

        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Setup</h1>
          <p className="text-gray-600">Let's get your shop configured and ready to go</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              onNext={currentStep === steps.length - 1 ? handleComplete : handleNext}
              onPrevious={handlePrevious}
              data={formData}
              updateData={updateFormData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
