
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';
import { Printer, Share, RotateCcw } from 'lucide-react';
import { useWorkOrderReopen } from '@/hooks/useWorkOrderReopen';
import { printElement } from '@/utils/printUtils';

interface WorkOrderDetailsActionsProps {
  workOrder: WorkOrder;
  onInvoiceCreated?: (invoiceId: string) => void;
  onWorkOrderUpdated?: () => void;
}

export function WorkOrderDetailsActions({ 
  workOrder, 
  onInvoiceCreated,
  onWorkOrderUpdated 
}: WorkOrderDetailsActionsProps) {
  const { reopenWorkOrder, isReopening } = useWorkOrderReopen();
  
  const handleReopenWorkOrder = async () => {
    console.log('🔄 REOPEN DEBUG: Button clicked!');
    console.log('🔄 REOPEN DEBUG: Work Order ID:', workOrder.id);
    console.log('🔄 REOPEN DEBUG: Current Status:', workOrder.status);
    console.log('🔄 REOPEN DEBUG: Is Reopening:', isReopening);
    
    try {
      const result = await reopenWorkOrder(workOrder.id, 'in-progress');
      console.log('🔄 REOPEN DEBUG: Service result:', result);
      
      if (result.success && onWorkOrderUpdated) {
        console.log('🔄 REOPEN DEBUG: Calling onWorkOrderUpdated callback');
        onWorkOrderUpdated();
      } else {
        console.log('🔄 REOPEN DEBUG: Not calling callback - success:', result.success, 'callback exists:', !!onWorkOrderUpdated);
      }
    } catch (error) {
      console.error('🔄 REOPEN DEBUG: Error in handleReopenWorkOrder:', error);
    }
  };

  const handlePrint = () => {
    // Use browser's native print which will show our professional print layout
    window.print();
  };

  const isCompleted = workOrder.status === 'completed';
  
  // Debug logging to understand button state
  console.log('🔍 BUTTON DEBUG: Work Order Status:', workOrder.status);
  console.log('🔍 BUTTON DEBUG: Is Completed:', isCompleted);
  console.log('🔍 BUTTON DEBUG: Is Reopening:', isReopening);
  console.log('🔍 BUTTON DEBUG: Button should be visible:', isCompleted);
  console.log('🔍 BUTTON DEBUG: Button should be disabled:', isReopening);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      
      <Button variant="outline" size="sm">
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>

      {isCompleted && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReopenWorkOrder}
          disabled={isReopening}
          className="bg-background border-border hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {isReopening ? 'Reopening...' : 'Reopen Work Order'}
        </Button>
      )}

      <ConvertToInvoiceButton
        workOrderId={workOrder.id}
        workOrderStatus={workOrder.status}
        onSuccess={onInvoiceCreated}
      />
    </div>
  );
}
