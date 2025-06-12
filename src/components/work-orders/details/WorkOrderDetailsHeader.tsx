
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { WorkOrderStatusUpdate } from './WorkOrderStatusUpdate';
import { useNavigate, Link } from 'react-router-dom';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
  isEditMode?: boolean;
}

export function WorkOrderDetailsHeader({ 
  workOrder, 
  onEdit, 
  onInvoiceCreated,
  isEditMode 
}: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(workOrder.status);

  const handleStatusUpdated = (newStatus: string) => {
    setCurrentStatus(newStatus);
    // Force a page refresh to update all components with the new status
    window.location.reload();
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Work Order #{workOrder.work_order_number || workOrder.id?.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Customer: {workOrder.customer_id ? (
                  <Link 
                    to={`/customers/${workOrder.customer_id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {workOrder.customer_name || 'Unknown Customer'}
                  </Link>
                ) : (
                  <span>{workOrder.customer_name || 'Unknown Customer'}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WorkOrderStatusUpdate 
              workOrder={{ ...workOrder, status: currentStatus }}
              onStatusUpdated={handleStatusUpdated}
            />
            
            <WorkOrderDetailsActions
              workOrder={{ ...workOrder, status: currentStatus }}
              onEdit={onEdit}
              onInvoiceCreated={onInvoiceCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
