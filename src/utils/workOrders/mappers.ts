
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
    start: workOrder.date || workOrder.created_at,
    end: workOrder.dueDate,
    customerId: workOrder.customer_id,
    workOrderId: workOrder.id,
    type: 'work_order',
    status: workOrder.status
  };
};

/**
 * Map database model to app model (for backward compatibility)
 */
export const mapDatabaseToAppModel = (data: any): WorkOrder => {
  return {
    id: data.id,
    customer: data.customer || '',
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    description: data.description,
    service_type: data.service_type,
    status: data.status,
    priority: data.priority || 'medium',
    date: data.created_at,
    dueDate: data.end_time || data.created_at,
    technician: data.technician || '',
    technician_id: data.technician_id,
    location: data.location || '',
    notes: data.notes || data.description || '',
    created_at: data.created_at,
    updated_at: data.updated_at,
    invoice_id: data.invoice_id,
    total_cost: data.total_cost,
    estimated_hours: data.estimated_hours,
    timeEntries: data.timeEntries || [],
    inventoryItems: data.inventoryItems || []
  };
};
