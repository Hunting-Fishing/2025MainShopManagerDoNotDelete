
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId: propWorkOrderId }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const workOrderId = propWorkOrderId || id;

  if (!workOrderId) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No work order ID provided.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => navigate('/work-orders')}>
                  Back to Work Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Work order details for ID: {workOrderId}</p>
            <p className="mt-2">Full work order details will be displayed here.</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={() => navigate('/work-orders')}>
                Back to Work Orders
              </Button>
              <Button onClick={() => navigate(`/work-orders/${workOrderId}/edit`)}>
                Edit Work Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
