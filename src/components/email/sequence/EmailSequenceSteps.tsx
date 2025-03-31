
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailSequence, EmailSequenceStep } from '@/types/email';
import { EmailSequenceFlow } from './EmailSequenceFlow';

interface EmailSequenceStepsProps {
  sequenceId: string;
  steps: EmailSequenceStep[];
}

export function EmailSequenceSteps({ sequenceId, steps }: EmailSequenceStepsProps) {
  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>This sequence doesn't have any steps yet.</p>
            <p className="mt-2">Add steps to define the email sequence flow.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a minimal EmailSequence object with required properties
  const sequenceData: EmailSequence = { 
    id: sequenceId, 
    steps, 
    name: '',
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shop_id: '',
    created_by: '',
    trigger_type: 'manual',
    trigger_event: '',
    is_active: false
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <EmailSequenceFlow sequence={sequenceData} />
      </CardContent>
    </Card>
  );
}
