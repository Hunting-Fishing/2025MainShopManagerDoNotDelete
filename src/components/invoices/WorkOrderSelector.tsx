
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { WorkOrder } from '@/types/workOrder';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';

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
export const WorkOrderSelector: React.FC = () => {
  // This component is just a placeholder for now
  return <div>WorkOrderSelector</div>;
};
