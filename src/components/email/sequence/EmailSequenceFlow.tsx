
import React from 'react';
import { EmailSequence, EmailSequenceStep } from '@/types/email';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Clock, ArrowDown } from 'lucide-react';

interface EmailSequenceFlowProps {
  sequence: EmailSequence;
}

export const EmailSequenceFlow: React.FC<EmailSequenceFlowProps> = ({ sequence }) => {
  if (!sequence?.steps || sequence.steps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">This sequence doesn't have any steps yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sequence.steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepItem step={step} stepNumber={index + 1} />
          {index < sequence.steps.length - 1 && (
            <div className="flex justify-center my-2">
              <ArrowDown className="text-gray-400" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface StepItemProps {
  step: EmailSequenceStep;
  stepNumber: number;
}

const StepItem: React.FC<StepItemProps> = ({ step, stepNumber }) => {
  return (
    <Card>
      <CardHeader className={`flex flex-row items-center space-y-0 p-4 ${
        step.type === 'email' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center">
          {step.type === 'email' ? (
            <Mail className="h-4 w-4 text-blue-500 mr-2" />
          ) : (
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
          )}
          <span className="font-medium">
            Step {stepNumber}: {step.name || (step.type === 'email' ? 'Send Email' : 'Wait')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {step.type === 'email' ? (
          <div>
            <p className="text-sm">
              {step.templateId || step.email_template_id ? `Template ID: ${step.templateId || step.email_template_id}` : 'No template selected'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm">
              Wait for {step.delayHours || 0} hours ({step.delayType || 'fixed'})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
