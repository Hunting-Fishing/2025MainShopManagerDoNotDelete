
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
    <div className="modern-card work-order-header gradient-border p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-heading gradient-text">
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
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-subtle border border-border/50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground font-body">Customer:</span>
                  <span className="font-semibold text-foreground font-body">
                    {customer.first_name} {customer.last_name}
                  </span>
                </div>
                {customer.email && (
                  <div className="text-sm text-muted-foreground font-body truncate">
                    {customer.email}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {workOrder.description && (
            <div className="p-4 rounded-lg bg-gradient-subtle border-l-4 border-primary/40 border border-border/30">
              <p className="text-foreground leading-relaxed font-medium font-body">
                {workOrder.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
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
    </div>
  );
}
