
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrder } from '@/types/workOrder';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { createInvoiceUpdater } from '@/types/invoice';

// Export the hook to be used by other components
export function useWorkOrderSelector({
  invoice,
  setInvoice,
  handleSelectWorkOrder
}: {
  invoice: Invoice;
  setInvoice: (invoice: Invoice | ((prev: Invoice) => Invoice)) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
}) {
  // Function to handle work order selection with time entries calculation
  const handleSelectWorkOrderWithTime = (workOrder: WorkOrder) => {
    if (!workOrder) return;

    // Calculate total hours from time entries if they exist
    let totalHours = 0;
    if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
      totalHours = workOrder.timeEntries.reduce((total, entry) => total + entry.duration, 0) / 60;
    }

    // Add time entries to invoice items if needed
    handleSelectWorkOrder(workOrder);
  };

  return {
    handleSelectWorkOrderWithTime
  };
}

// Export the WorkOrderSelector component
export function WorkOrderSelector({
  isOpen,
  onClose,
  onSelectWorkOrder,
  workOrders
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
  workOrders: WorkOrder[];
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Work Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No work orders found</p>
          ) : (
            <div className="grid gap-2">
              {workOrders.map((workOrder) => (
                <Button
                  key={workOrder.id}
                  variant="outline"
                  className="flex justify-between items-center w-full p-4 h-auto"
                  onClick={() => {
                    onSelectWorkOrder(workOrder);
                    onClose();
                  }}
                >
                  <div className="text-left">
                    <p className="font-medium">{workOrder.description || `Work Order #${workOrder.id}`}</p>
                    <p className="text-sm text-gray-500">
                      {workOrder.customer ? `Customer: ${workOrder.customer}` : 'No customer assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{workOrder.status}</p>
                    <p className="text-xs text-gray-500">{workOrder.created_at}</p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
