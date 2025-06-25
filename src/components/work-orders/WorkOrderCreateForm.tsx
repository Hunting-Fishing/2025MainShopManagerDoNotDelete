
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { WorkOrderForm } from './WorkOrderForm';

interface WorkOrderCreateFormProps {
  form?: any;
  onSubmit?: () => void;
}

export function WorkOrderCreateForm({ form, onSubmit }: WorkOrderCreateFormProps) {
  const navigate = useNavigate();

  const handleFormSubmit = (data: any) => {
    console.log('Work order form submitted:', data);
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
