
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, Settings, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkOrderProgressIndicatorProps {
  status: string;
  progress: number;
  estimatedCompletion: string;
}

export function WorkOrderProgressIndicator({ 
  status, 
  progress, 
  estimatedCompletion 
}: WorkOrderProgressIndicatorProps) {
  const steps = [
    { key: 'received', label: 'Received', icon: Clock },
    { key: 'in-progress', label: 'In Progress', icon: Settings },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];
  
  const getCurrentStepIndex = () => {
    switch(status) {
      case 'pending':
        return 0;
      case 'in-progress':
        return 1;
      case 'completed':
        return 2;
      default:
        return 0;
    }
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Progress value={progress} className="h-2" />
        <span className="ml-4 text-sm font-medium">{progress}%</span>
      </div>
      
      <div className="flex justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;
          const StepIcon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCompleted ? "bg-green-100 border-2 border-green-500 text-green-600" : 
                  isActive ? "bg-blue-100 border-2 border-blue-500 text-blue-600" : 
                  "bg-gray-100 border-2 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted && index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span 
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-blue-600" : 
                  isCompleted ? "text-green-600" : 
                  "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {estimatedCompletion && status !== 'completed' && (
        <div className="flex justify-center mt-4">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Estimated completion:</span>{' '}
            {new Date(estimatedCompletion).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
