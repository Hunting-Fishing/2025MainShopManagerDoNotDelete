
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Building2, Settings, Database, Rocket } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessSettingsStep } from './steps/BusinessSettingsStep';
import { SampleDataStep } from './steps/SampleDataStep';
import { CompletionStep } from './steps/CompletionStep';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ onNext: () => void; onPrevious: () => void; data: any; updateData: (data: any) => void; }>;
}

const steps: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your automotive shop',
    icon: <Building2 className="h-6 w-6" />,
    component: BasicInfoStep,
  },
  {
    id: 'business-settings',
    title: 'Business Settings',
    description: 'Configure your operating hours and preferences',
    icon: <Settings className="h-6 w-6" />,
    component: BusinessSettingsStep,
  },
  {
    id: 'sample-data',
    title: 'Sample Data',
    description: 'Import sample customers and inventory to get started',
    icon: <Database className="h-6 w-6" />,
    component: SampleDataStep,
  },
  {
    id: 'completion',
    title: 'Ready to Go!',
    description: 'Your shop is set up and ready for business',
    icon: <Rocket className="h-6 w-6" />,
    component: CompletionStep,
  },
];

export function ShopOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [onboardingData, setOnboardingData] = useState({
    basicInfo: {},
    businessSettings: {},
    sampleData: { importCustomers: false, importInventory: false, importServices: false },
  });

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    console.log('ShopOnboardingWizard handleNext called');
    console.log('Current step:', currentStep);
    console.log('Total steps:', steps.length);
    
    // Mark current step as completed
    const newCompletedSteps = new Set([...completedSteps, currentStep]);
    setCompletedSteps(newCompletedSteps);
    console.log('Completed steps updated:', Array.from(newCompletedSteps));
    
    // Navigate to next step if not at the end
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      console.log('Navigating to step:', nextStep);
      setCurrentStep(nextStep);
    } else {
      console.log('Already at last step, not navigating further');
    }
  };

  const handlePrevious = () => {
    console.log('ShopOnboardingWizard handlePrevious called');
    console.log('Current step:', currentStep);
    
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      console.log('Navigating to previous step:', prevStep);
      setCurrentStep(prevStep);
    } else {
      console.log('Already at first step, cannot go back');
    }
  };

  const updateData = (stepData: any) => {
    const stepKey = steps[currentStep].id === 'basic-info' ? 'basicInfo' 
                  : steps[currentStep].id === 'business-settings' ? 'businessSettings'
                  : steps[currentStep].id === 'sample-data' ? 'sampleData'
                  : steps[currentStep].id;
    
    console.log('Updating onboarding data for step:', stepKey);
    console.log('New step data:', stepData);
    
    setOnboardingData(prev => {
      const updated = {
        ...prev,
        [stepKey]: { ...prev[stepKey as keyof typeof prev], ...stepData }
      };
      console.log('Updated onboarding data:', updated);
      return updated;
    });
  };

  // Debug logging for step changes
  React.useEffect(() => {
    console.log('Current step changed to:', currentStep);
    console.log('Current step info:', steps[currentStep]);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Easy Shop Manager
          </h1>
          <p className="text-lg text-gray-600">
            Let's get your automotive shop set up in just a few minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                  completedSteps.has(index)
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-sm font-medium text-center max-w-20">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-lg">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              onNext={handleNext}
              onPrevious={handlePrevious}
              data={onboardingData}
              updateData={updateData}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help? Contact our support team at support@easyshopmanager.com
        </div>
      </div>
    </div>
  );
}
