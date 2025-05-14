
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  MoreHorizontal, 
  FileText,
  Trash2,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/workOrders';
import { WorkOrderChatButton } from '../WorkOrderChatButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { SendSmsButton } from '@/components/calls/SendSmsButton';
import { VoiceCallButton } from '@/components/calls/VoiceCallButton';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  onDelete?: () => void;
}

export const WorkOrderDetailsHeader: React.FC<WorkOrderDetailsHeaderProps> = ({ 
  workOrder, 
  onDelete = () => {} 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleEdit = () => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  };
  
  const handleCreateInvoice = () => {
    navigate(`/invoices/new?workOrder=${workOrder.id}`);
  };

  // This would come from customer data in a real app
  const phoneNumber = "";
  const customerId = "";

  return (
    <div className="flex flex-col space-y-4 pb-4 md:pb-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/work-orders">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Work Orders</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{workOrder.id}</h1>
          <div className="text-slate-500 mb-2">Created on {formatDate(workOrder.date)}</div>
          <div className="text-lg font-medium">{workOrder.customer}</div>
          <div className="text-slate-700">{workOrder.description}</div>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-wrap' : ''} items-center gap-2`}>
          <WorkOrderChatButton 
            workOrderId={workOrder.id} 
            workOrderName={`${workOrder.id}: ${workOrder.description}`}
          />
          
          {/* SMS and Call buttons */}
          <SendSmsButton 
            phoneNumber={phoneNumber} 
            message={`Hello, regarding your work order ${workOrder.id}`}
            customerId={customerId}
            variant="outline"
            size="sm"
          />
          
          <VoiceCallButton
            phoneNumber={phoneNumber}
            callType="appointment_reminder"
            customerId={customerId}
            variant="outline"
            size="sm"
          />
          
          {!isMobile && (
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {isMobile ? '' : 'Edit'}
          </Button>
          <Button onClick={handleCreateInvoice}>
            <FileText className="h-4 w-4 mr-2" />
            {isMobile ? '' : 'Create Invoice'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isMobile && (
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Work Order
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Duplicate Work Order</DropdownMenuItem>
              <DropdownMenuItem>Email Work Order</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Work Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
