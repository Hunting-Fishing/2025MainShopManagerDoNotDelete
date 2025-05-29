
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Building2, Clock, FileText } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';
import { CompletionStep } from './steps/CompletionStep';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  
  // Logo
  logoUrl?: string;
}

const steps = [
  {
    id: 0,
    title: 'Basic Information',
    description: 'Shop name, contact info, and address',
    icon: Building2,
  },
  {
    id: 1,
    title: 'Business Details',
    description: 'Tax ID, business type, and industry',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Business Hours',
    description: 'Set your operating hours',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Complete Setup',
    description: 'Review and finish setup',
    icon: CheckCircle,
  },
];

export function ShopOnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const updateData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

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
    if (isCompleting) return;
    
    setIsCompleting(true);
    
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

      const shopId = profile.shop_id;

      // Mark onboarding as complete in shops table
      const { error: shopError } = await supabase
        .from('shops')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId);

      if (shopError) {
        console.error('Error updating shop:', shopError);
        throw shopError;
      }

      // Convert formData to JSON-compatible format
      const stepDataJson = JSON.parse(JSON.stringify(formData));

      // Update or insert onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: shopId,
          current_step: 3,
          completed_steps: [0, 1, 2, 3],
          is_completed: true,
          step_data: stepDataJson,
          updated_at: new Date().toISOString()
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
        throw progressError;
      }

      toast.success('Onboarding completed successfully!');
      
      // Navigate to dashboard
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      data: formData,
      updateData,
    };

    switch (currentStep) {
      case 0:
        return <BasicInfoStep {...stepProps} />;
      case 1:
        return <BusinessDetailsStep {...stepProps} />;
      case 2:
        return <BusinessHoursStep {...stepProps} />;
      case 3:
        return <CompletionStep {...stepProps} onComplete={handleComplete} />;
      default:
        return <BasicInfoStep {...stepProps} />;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Shop Management System
          </h1>
          <p className="text-gray-600">
            Let's get your shop set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? 'bg-blue-100 border-2 border-blue-600'
                        : isCompleted
                        ? 'bg-green-100 border-2 border-green-600'
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
