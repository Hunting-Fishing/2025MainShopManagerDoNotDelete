import React from 'react';
import { WorkOrder } from '@/types/workOrder';

// Accept and use a customer prop directly

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  customer?: import('@/types/customer').Customer | null;
}

export function WorkOrderDetailsHeader({
  workOrder,
  customer,
}: WorkOrderDetailsHeaderProps) {
  // Show customer info if available; otherwise fall back to unknown.
  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow-lg px-0 md:px-5 py-6 mb-3">
      <div className="flex flex-wrap gap-6 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex gap-2 items-center mb-0.5">
            Work Order
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded ml-2">
              {workOrder.id?.slice(0,8)}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Status: <span className="font-semibold">{workOrder.status}</span>
          </p>
        </div>
        <div className="w-full md:w-auto">
          <div className="bg-gray-50 rounded-lg px-5 py-3 shadow grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-8 border max-w-3xl">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Customer</p>
              {customer ? (
                <>
                  <span className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {customer.email && <div>{customer.email}</div>}
                    {customer.phone && <div>{customer.phone}</div>}
                  </div>
                </>
              ) : (
                <span className="text-gray-400">
                  Unknown Customer
                  {workOrder.customer_id && (
                    <> (customer_id: {workOrder.customer_id})</>
                  )}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Vehicle</p>
              {workOrder.vehicle_year || workOrder.vehicle_make || workOrder.vehicle_model ? (
                <span className="font-medium">
                  {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model].filter(Boolean).join(' ')}
                </span>
              ) : (
                <span className="text-gray-400">No Vehicle Info</span>
              )}
              {workOrder.vehicle_license_plate && (
                <div className="text-xs text-muted-foreground">License: {workOrder.vehicle_license_plate}</div>
              )}
              {workOrder.vehicle_vin && (
                <div className="text-xs text-muted-foreground">VIN: {workOrder.vehicle_vin}</div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Created</p>
              <span className="font-medium">
                {workOrder.created_at ? new Date(workOrder.created_at).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
