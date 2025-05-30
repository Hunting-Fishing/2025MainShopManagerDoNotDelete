
import { WorkOrder } from "@/types/workOrder";

/**
 * Normalize work order data from database format to application format
 */
export const normalizeWorkOrder = (dbWorkOrder: any): WorkOrder => {
  if (!dbWorkOrder) {
    throw new Error('Work order data is required');
  }

  return {
    id: dbWorkOrder.id,
    customer_id: dbWorkOrder.customer_id,
    vehicle_id: dbWorkOrder.vehicle_id,
    advisor_id: dbWorkOrder.advisor_id,
    technician_id: dbWorkOrder.technician_id,
    estimated_hours: dbWorkOrder.estimated_hours,
    total_cost: dbWorkOrder.total_cost,
    created_by: dbWorkOrder.created_by,
    created_at: dbWorkOrder.created_at,
    updated_at: dbWorkOrder.updated_at,
    start_time: dbWorkOrder.start_time,
    end_time: dbWorkOrder.end_time,
    service_category_id: dbWorkOrder.service_category_id,
    invoiced_at: dbWorkOrder.invoiced_at,
    status: dbWorkOrder.status || 'pending',
    description: dbWorkOrder.description || '',
    service_type: dbWorkOrder.service_type,
    invoice_id: dbWorkOrder.invoice_id,
    
    // Backward compatibility fields
    customer: dbWorkOrder.customer || '',
    technician: dbWorkOrder.technician || '',
    date: dbWorkOrder.created_at,
    dueDate: dbWorkOrder.end_time,
    due_date: dbWorkOrder.end_time,
    priority: dbWorkOrder.priority || 'medium',
    location: dbWorkOrder.location || '',
    notes: dbWorkOrder.notes || dbWorkOrder.description || '',
    
    // Additional fields
    timeEntries: [],
    inventoryItems: [],
    inventory_items: []
  };
};

/**
 * Format work order for database insertion/update
 */
export const formatWorkOrderForDb = (workOrder: Partial<WorkOrder>) => {
  return {
    customer_id: workOrder.customer_id,
    vehicle_id: workOrder.vehicle_id,
    advisor_id: workOrder.advisor_id,
    technician_id: workOrder.technician_id,
    estimated_hours: workOrder.estimated_hours,
    total_cost: workOrder.total_cost,
    created_by: workOrder.created_by,
    start_time: workOrder.start_time,
    end_time: workOrder.end_time || workOrder.dueDate,
    service_category_id: workOrder.service_category_id,
    status: workOrder.status || 'pending',
    description: workOrder.description,
    service_type: workOrder.service_type,
    invoice_id: workOrder.invoice_id
  };
};
