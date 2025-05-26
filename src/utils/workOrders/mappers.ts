
import { WorkOrder } from "@/types/workOrder";

/**
 * Map work order data between different formats
 */

/**
 * Map work order to invoice format
 */
export const mapWorkOrderToInvoice = (workOrder: WorkOrder) => {
  return {
    workOrderId: workOrder.id,
    customerId: workOrder.customer_id,
    description: workOrder.description,
    amount: workOrder.total_cost,
    date: workOrder.created_at
  };
};

/**
 * Map work order to calendar event format
 */
export const mapWorkOrderToCalendarEvent = (workOrder: WorkOrder) => {
  return {
    id: workOrder.id,
    title: `Work Order: ${workOrder.description || 'No description'}`,
    start: workOrder.start_time || workOrder.created_at,
    end: workOrder.end_time,
    customerId: workOrder.customer_id,
    workOrderId: workOrder.id,
    type: 'work_order',
    status: workOrder.status
  };
};
