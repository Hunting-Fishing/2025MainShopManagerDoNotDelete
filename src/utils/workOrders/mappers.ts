
import { WorkOrder, TimeEntry, DbTimeEntry } from "@/types/workOrder";

// Map time entry from DB format to app format
export const mapTimeEntryFromDb = (entry: any): TimeEntry => ({
  id: entry.id,
  employeeId: entry.employee_id,
  employeeName: entry.employee_name,
  startTime: entry.start_time,
  endTime: entry.end_time,
  duration: entry.duration,
  notes: entry.notes || '',
  billable: entry.billable || false
});

// Database to app model mapping
export const mapDatabaseToAppModel = (data: any): Partial<WorkOrder> => {
  const customers = data.customers as any || {};
  const profiles = data.profiles as any || {};
  const statusValue = data.status || 'pending';
  
  // Ensure status is one of the allowed values
  let typedStatus: WorkOrder["status"] = "pending";
  if (statusValue === "in-progress" || statusValue === "completed" || statusValue === "cancelled") {
    typedStatus = statusValue;
  }
  
  // Map time entries if they exist
  const timeEntries: TimeEntry[] = data.work_order_time_entries 
    ? data.work_order_time_entries.map((entry: any) => mapTimeEntryFromDb(entry))
    : [];
  
  const baseWorkOrder = {
    id: data.id,
    date: data.created_at,
    customer: `${customers?.first_name || ''} ${customers?.last_name || ''}`.trim(),
    description: data.description || '',
    status: typedStatus,
    priority: data.priority || "medium",
    technician: `${profiles?.first_name || ''} ${profiles?.last_name || ''}`.trim() || 'Unassigned',
    location: data.location || '',
    dueDate: data.end_time || '',
    notes: data.notes || '',
    timeEntries: timeEntries,
    totalBillableTime: timeEntries.reduce((sum, entry) => 
      sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
    createdBy: data.created_by || 'System',
    createdAt: data.created_at,
    lastUpdatedBy: data.updated_by || '',
    lastUpdatedAt: data.updated_at,
    vehicle_id: data.vehicle_id,
    vehicleId: data.vehicle_id,
  } as Partial<WorkOrder>;
  
  // Handle service category safely
  if (data.service_category) {
    baseWorkOrder.serviceCategory = data.service_category;
    baseWorkOrder.service_category = data.service_category;
  }
  
  return baseWorkOrder;
};

// Helper function to convert camelCase to snake_case for database storage
export const mapAppModelToDatabase = (workOrder: Partial<WorkOrder>) => {
  const result: any = {};

  // Handle specific field mappings
  if (workOrder.serviceCategory !== undefined) {
    result.service_category = workOrder.serviceCategory;
  } else if (workOrder.service_category !== undefined) {
    result.service_category = workOrder.service_category;
  }

  // Handle vehicle properties
  if (workOrder.vehicleId !== undefined) {
    result.vehicle_id = workOrder.vehicleId;
  } else if (workOrder.vehicle_id !== undefined) {
    result.vehicle_id = workOrder.vehicle_id;
  }

  if (workOrder.vehicleMake !== undefined) {
    result.vehicle_make = workOrder.vehicleMake;
  } else if (workOrder.vehicle_make !== undefined) {
    result.vehicle_make = workOrder.vehicle_make;
  }

  if (workOrder.vehicleModel !== undefined) {
    result.vehicle_model = workOrder.vehicleModel;
  } else if (workOrder.vehicle_model !== undefined) {
    result.vehicle_model = workOrder.vehicle_model;
  }

  // Standard fields
  result.description = workOrder.description;
  result.status = workOrder.status;
  result.customer = workOrder.customer;
  result.customer_id = typeof workOrder.customer !== 'string' ? workOrder.customer : null;
  result.technician = workOrder.technician;
  result.technician_id = typeof workOrder.technician !== 'string' ? workOrder.technician : null;
  result.location = workOrder.location;
  result.notes = workOrder.notes || '';
  result.due_date = workOrder.dueDate;
  result.end_time = workOrder.dueDate; // Map dueDate to end_time for database
  result.priority = workOrder.priority;
  result.total_cost = workOrder.total_cost || 0;
  result.estimated_hours = workOrder.estimated_hours || null;

  return result;
};
