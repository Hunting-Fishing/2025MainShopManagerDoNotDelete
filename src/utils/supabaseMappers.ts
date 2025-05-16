
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";

// Maps our application WorkOrder type to Supabase database format
export const mapToDbWorkOrder = (workOrder: Partial<WorkOrder>) => {
  return {
    id: workOrder.id,
    customer: workOrder.customer,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    date: workOrder.date,
    due_date: workOrder.dueDate,
    technician: workOrder.technician,
    location: workOrder.location,
    notes: workOrder.notes,
    total_billable_time: workOrder.totalBillableTime,
    created_by: workOrder.created_by,
    created_at: workOrder.createdAt,
    last_updated_by: workOrder.last_updated_by,
    last_updated_at: workOrder.lastUpdatedAt
  };
};

// Maps from Supabase to our application WorkOrder format
export const mapFromDbWorkOrder = (dbWorkOrder: any, timeEntries: TimeEntry[] = [], inventoryItems: WorkOrderInventoryItem[] = []): WorkOrder => {
  return {
    id: dbWorkOrder.id,
    customer: dbWorkOrder.customer,
    description: dbWorkOrder.description || '',
    status: dbWorkOrder.status,
    priority: dbWorkOrder.priority,
    date: dbWorkOrder.date,
    dueDate: dbWorkOrder.due_date,
    technician: dbWorkOrder.technician,
    location: dbWorkOrder.location,
    notes: dbWorkOrder.notes || '',
    totalBillableTime: dbWorkOrder.total_billable_time || 0,
    created_by: dbWorkOrder.created_by,
    createdAt: dbWorkOrder.created_at,
    last_updated_by: dbWorkOrder.last_updated_by,
    lastUpdatedAt: dbWorkOrder.last_updated_at,
    timeEntries,
    inventoryItems
  };
};

// Map time entry from DB format to app format
export const mapTimeEntryFromDb = (entry: any): TimeEntry => ({
  id: entry.id,
  employee_id: entry.employee_id,
  employee_name: entry.employee_name,
  start_time: entry.start_time,
  end_time: entry.end_time,
  duration: entry.duration,
  notes: entry.notes,
  billable: entry.billable
});

// Map inventory item from DB format to app format
export const mapInventoryItemFromDb = (item: any): WorkOrderInventoryItem => ({
  id: item.id,
  name: item.name,
  sku: item.sku,
  category: item.category,
  quantity: item.quantity,
  unit_price: item.unit_price
});
