
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderStatusBadge } from '../WorkOrderStatusBadge';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { EditModeIndicator } from '../debug/EditModeIndicator';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  currentStatus: string;
  isUpdatingStatus: boolean;
  onStatusChange: (newStatus: string) => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderDetailsHeader({
  workOrder,
  customer,
  currentStatus,
  isUpdatingStatus,
  onStatusChange,
  isEditMode
}: WorkOrderDetailsHeaderProps) {
  const handleStatusChange = async (newStatus: string) => {
    await onStatusChange(newStatus);
  };

  return (
    <div className="modern-card work-order-header gradient-border p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground font-heading gradient-text">
              Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
            </h1>
            <WorkOrderStatusBadge status={currentStatus} />
            <EditModeIndicator 
              workOrder={workOrder} 
              isEditMode={isEditMode}
              onStatusChange={handleStatusChange}
              className="ml-2"
            />
          </div>
          
          {customer && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border">
              <span className="text-sm font-medium text-muted-foreground">Customer:</span>
              <span className="font-semibold text-foreground">
                {customer.first_name} {customer.last_name}
              </span>
              {customer.email && (
                <span className="text-sm text-muted-foreground">({customer.email})</span>
              )}
            </div>
          )}
          
          {workOrder.description && (
            <div className="p-4 rounded-lg bg-muted/20 border-l-4 border-primary/40">
              <p className="text-foreground leading-relaxed max-w-2xl font-medium">
                {workOrder.description}
              </p>
            </div>
          )}
        </div>

        <WorkOrderDetailsActions
          workOrder={workOrder}
          onInvoiceCreated={(invoiceId) => {
            console.log('Invoice created:', invoiceId);
          }}
          onWorkOrderUpdated={() => {
            // This will trigger a refresh of the work order data
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
