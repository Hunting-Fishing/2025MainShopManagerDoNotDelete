
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
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
            <p className="text-slate-600">
              Customer: {customer.first_name} {customer.last_name}
              {customer.email && (
                <span className="text-slate-500 ml-2">({customer.email})</span>
              )}
            </p>
          )}
          
          {workOrder.description && (
            <p className="text-slate-600 max-w-2xl">
              {workOrder.description}
            </p>
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
