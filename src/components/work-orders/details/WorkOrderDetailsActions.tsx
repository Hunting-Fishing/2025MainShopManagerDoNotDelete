
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';
import { Edit, Printer, Share, Check, X } from 'lucide-react';

interface WorkOrderDetailsActionsProps {
  workOrder: WorkOrder;
  isEditMode?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function WorkOrderDetailsActions({ 
  workOrder, 
  isEditMode = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onInvoiceCreated 
}: WorkOrderDetailsActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {!isEditMode ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onStartEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onSaveEdit}
            className="text-green-700 border-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancelEdit}
            className="text-slate-600"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </>
      )}
      
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
