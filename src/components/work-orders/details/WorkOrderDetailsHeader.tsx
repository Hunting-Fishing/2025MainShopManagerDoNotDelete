
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
  isEditMode?: boolean;
}

export function WorkOrderDetailsHeader({ 
  workOrder, 
  onEdit,
  onInvoiceCreated,
  isEditMode 
}: WorkOrderDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">
              Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status}
              </Badge>
              {workOrder.customer_name && (
                <span className="text-muted-foreground">
                  Customer: {workOrder.customer_name}
                </span>
              )}
            </div>
          </div>
          <WorkOrderDetailsActions
            workOrder={workOrder}
            onEdit={onEdit}
            onInvoiceCreated={onInvoiceCreated}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">
              {new Date(workOrder.created_at).toLocaleDateString()}
            </p>
          </div>
          {workOrder.vehicle_make && workOrder.vehicle_model && (
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
            </div>
          )}
          {workOrder.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{workOrder.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
