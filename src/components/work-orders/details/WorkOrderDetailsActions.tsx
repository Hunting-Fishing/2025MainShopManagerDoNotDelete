
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';
import { Printer, Share } from 'lucide-react';

interface WorkOrderDetailsActionsProps {
  workOrder: WorkOrder;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function WorkOrderDetailsActions({ 
  workOrder, 
  onInvoiceCreated 
}: WorkOrderDetailsActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      
      <Button variant="outline" size="sm">
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>

      <ConvertToInvoiceButton
        workOrderId={workOrder.id}
        workOrderStatus={workOrder.status}
        onSuccess={onInvoiceCreated}
      />
    </div>
  );
}
