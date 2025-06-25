
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkOrderErrorBoundary } from './WorkOrderErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

function WorkOrderDetailsContent({ workOrderId }: { workOrderId: string }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Work order details for ID: {workOrderId}
            </p>
            <p className="text-sm text-muted-foreground">
              Full work order details implementation will be displayed here.
            </p>
            <div className="flex gap-2">
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
    <WorkOrderErrorBoundary>
      <WorkOrderDetailsContent workOrderId={workOrderId} />
    </WorkOrderErrorBoundary>
  );
}
