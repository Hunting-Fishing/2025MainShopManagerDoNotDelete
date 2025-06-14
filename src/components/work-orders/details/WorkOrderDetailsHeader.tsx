
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { WorkOrderStatusUpdate } from './WorkOrderStatusUpdate';
import { useNavigate, Link } from 'react-router-dom';

// Import types for customer (if not already)
import { Customer } from '@/types/customer';

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

  // Customer state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCustomer() {
      if (workOrder.customer_id) {
        setCustomerLoading(true);
        setCustomerError(null);
        try {
          // Dynamically import the customer query service
          const { getCustomerById } = await import('@/services/customer/customerQueryService');
          const data = await getCustomerById(workOrder.customer_id!);
          if (!cancelled) {
            setCustomer(data);
          }
        } catch (err) {
          if (!cancelled) {
            setCustomer(null);
            setCustomerError('Failed to load customer information');
          }
        } finally {
          if (!cancelled) setCustomerLoading(false);
        }
      } else {
        setCustomer(null);
      }
    }
    fetchCustomer();
    return () => { cancelled = true; };
  }, [workOrder.customer_id]);

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
              <p className="text-sm text-gray-600 mt-1 font-medium">
                Customer:{" "}
                {customerLoading ? (
                  <span className="animate-pulse text-gray-400">Loading...</span>
                ) : customerError ? (
                  <span className="text-red-500">{customerError}</span>
                ) : customer ? (
                  <>
                    <Link 
                      to={`/customers/${customer.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {customer.first_name || ''} {customer.last_name || ''}
                    </Link>
                    {customer.email && (
                      <span className="ml-2 text-gray-500">{customer.email}</span>
                    )}
                    {customer.phone && (
                      <span className="ml-2 text-gray-500">{customer.phone}</span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">Unknown Customer</span>
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
