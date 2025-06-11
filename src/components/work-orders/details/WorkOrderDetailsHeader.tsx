
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {new Date(workOrder.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getStatusColor(workOrder.status)} font-medium px-3 py-1`}>
                {workOrder.status?.charAt(0).toUpperCase() + workOrder.status?.slice(1)}
              </Badge>
              {workOrder.customer_name && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-gray-900">{workOrder.customer_name}</span>
                </div>
              )}
              {workOrder.total_cost && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(workOrder.total_cost)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <WorkOrderDetailsActions
              workOrder={workOrder}
              onEdit={onEdit}
              onInvoiceCreated={onInvoiceCreated}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(workOrder.created_at).toLocaleDateString()}
            </p>
          </div>
          
          {workOrder.vehicle_make && workOrder.vehicle_model && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vehicle</p>
              <p className="text-sm font-medium text-gray-900">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
              {workOrder.vehicle_license_plate && (
                <p className="text-xs text-muted-foreground">
                  License: {workOrder.vehicle_license_plate}
                </p>
              )}
            </div>
          )}
          
          {workOrder.description && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {workOrder.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
