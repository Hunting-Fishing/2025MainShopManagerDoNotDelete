
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WorkOrderCreateFormProps {
  form: any;
  onSubmit: () => void;
}

export function WorkOrderCreateForm({ form, onSubmit }: WorkOrderCreateFormProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Work order creation form will be implemented here.</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={() => navigate('/work-orders')}>
                Cancel
              </Button>
              <Button onClick={onSubmit}>
                Create Work Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
