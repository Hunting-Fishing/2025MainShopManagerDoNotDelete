
import { Invoice } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';

export const useInvoiceWorkOrder = () => {
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    if (!workOrder) return { workOrderId: '', customer: '', customerAddress: '', assignedStaff: [] };

    return {
      workOrderId: workOrder.id,
      customer: workOrder.customer || '',
      customerAddress: workOrder.customer_address || '',
      description: workOrder.description || '',
      assignedStaff: workOrder.technician ? [workOrder.technician] : []
    };
  };

  return { handleSelectWorkOrder };
};
