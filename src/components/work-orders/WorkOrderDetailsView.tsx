
import React from 'react';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { WorkOrderDetailsActions } from './details/WorkOrderDetailsActions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const { workOrder, isLoading, error } = useWorkOrder(workOrderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Work order not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const handleEdit = () => {
    // Navigate to edit page or show edit modal
    console.log('Edit work order:', workOrderId);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    console.log('Invoice created:', invoiceId);
    // Handle navigation or refresh
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{workOrder.status}</Badge>
            {workOrder.service_type && (
              <Badge variant="outline">{workOrder.service_type}</Badge>
            )}
          </div>
        </div>
        
        <WorkOrderDetailsActions
          workOrder={workOrder}
          onEdit={handleEdit}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Order Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{workOrder.description || 'No description provided'}</p>
              </div>
              
              {workOrder.total_cost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                  <p className="mt-1 text-lg font-semibold">${workOrder.total_cost}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1">{new Date(workOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1">{new Date(workOrder.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Customer details will be loaded here</p>
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Vehicle details will be loaded here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simplified tabs for now - will be enhanced later */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional work order details and tabs will be displayed here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
