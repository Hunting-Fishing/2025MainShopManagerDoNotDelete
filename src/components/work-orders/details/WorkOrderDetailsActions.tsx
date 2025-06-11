
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';
import { WorkOrderExportMenu } from '../WorkOrderExportMenu';
import { Edit, Printer, Share, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { printElement } from '@/utils/printUtils';

interface WorkOrderDetailsActionsProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function WorkOrderDetailsActions({ 
  workOrder, 
  onEdit,
  onInvoiceCreated 
}: WorkOrderDetailsActionsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handlePrint = () => {
    try {
      // Print the entire work order details page
      printElement('work-order-details-content', `Work Order ${workOrder.work_order_number || workOrder.id.slice(0, 8)}`);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Unable to print work order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: `Work Order #${workOrder.work_order_number || workOrder.id.slice(0, 8)}`,
        text: `Work Order details for ${workOrder.customer_name || 'customer'}`,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Work order details have been shared."
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Work order link has been copied to clipboard."
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast({
          title: "Share Error",
          description: "Unable to share work order. Link copied to clipboard instead.",
          variant: "destructive"
        });
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onEdit}
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
      >
        <Edit className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handlePrint}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Print</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleShare}
        disabled={isSharing}
        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
      >
        <Share className="h-4 w-4" />
        <span className="hidden sm:inline">{isSharing ? 'Sharing...' : 'Share'}</span>
      </Button>

      <WorkOrderExportMenu workOrder={workOrder} />

      <ConvertToInvoiceButton
        workOrderId={workOrder.id}
        workOrderStatus={workOrder.status}
        onSuccess={onInvoiceCreated}
      />
    </div>
  );
}
