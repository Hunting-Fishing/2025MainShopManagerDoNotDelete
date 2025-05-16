
import { Invoice } from '@/types/invoice';
import { WorkOrder } from '@/types/workOrder';

export const useInvoiceWorkOrder = () => {
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    if (!workOrder) return { workOrderId: '', customer: '', customerAddress: '', assignedStaff: [] };

    // Handle potentially missing properties safely
    return {
      workOrderId: workOrder.id,
      customer: workOrder.customer || '',
      customerAddress: workOrder.customer_address || workOrder.address || '', // Handle both property names
      description: workOrder.description || '',
      assignedStaff: workOrder.technician ? [{ id: workOrder.technician_id || '', name: workOrder.technician }] : []
    };
  };

  return { handleSelectWorkOrder };
};
