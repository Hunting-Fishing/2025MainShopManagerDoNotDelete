
import { WorkOrder, TimeEntry, DbTimeEntry, WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";
import { normalizeWorkOrder } from "./formatters";

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
export const mapDatabaseToAppModel = (data: any): WorkOrder => {
  // Handle missing data gracefully
  const customers = data.customers || {};
  const profiles = data.profiles || {};
  
  // Ensure status is one of the allowed values
  let typedStatus: WorkOrderStatusType = "pending";
  if (["in-progress", "completed", "cancelled"].includes(data.status)) {
    typedStatus = data.status as WorkOrderStatusType;
  }
  
  // Map time entries if they exist
  const timeEntries: TimeEntry[] = data.work_order_time_entries 
    ? data.work_order_time_entries.map((entry: any) => mapTimeEntryFromDb(entry))
    : [];
  
  // Build customer name from first and last name
  const customerName = customers 
    ? `${customers.first_name || ''} ${customers.last_name || ''}`.trim() 
    : 'Unknown Customer';
  
  // Build technician name from first and last name
  const technicianName = profiles 
    ? `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim() 
    : 'Unassigned';

  // Create the work order object with all necessary fields
  const workOrder: WorkOrder = {
    id: data.id,
    date: data.created_at,
    customer: customerName,
    customerId: data.customer_id,
    customer_id: data.customer_id,
    description: data.description || '',
    status: typedStatus,
    priority: determinePriority(data) as WorkOrderPriorityType,
    technician: technicianName || 'Unassigned',
    technicianId: data.technician_id,
    technician_id: data.technician_id,
    location: data.location || '',
    dueDate: data.end_time || data.created_at || '',
    notes: data.notes || '',
    timeEntries: timeEntries,
    totalBillableTime: timeEntries.reduce((sum, entry) => 
      sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
    createdBy: data.created_by || 'System',
    createdAt: data.created_at,
    created_at: data.created_at,
    lastUpdatedBy: data.updated_by || '',
    updatedAt: data.updated_at,
    updated_at: data.updated_at,
    lastUpdatedAt: data.updated_at,
    vehicle_id: data.vehicle_id,
    vehicleId: data.vehicle_id,
    vehicle_make: data.vehicle_make,
    vehicleMake: data.vehicle_make,
    vehicle_model: data.vehicle_model,
    vehicleModel: data.vehicle_model,
    serviceType: data.service_type,
    service_type: data.service_type,
    totalCost: data.total_cost,
    total_cost: data.total_cost,
  };
  
  // Handle service category safely
  if (data.service_category !== undefined) {
    workOrder.serviceCategory = data.service_category;
    workOrder.service_category = data.service_category;
  }
  
  return normalizeWorkOrder(workOrder);
};

// Helper function to convert camelCase to snake_case for database storage
export const mapAppModelToDatabase = (workOrder: Partial<WorkOrder>) => {
  const result: any = {};

  // Standard fields
  result.description = workOrder.description;
  result.status = workOrder.status;
  result.customer_id = typeof workOrder.customerId !== 'string' ? workOrder.customerId : workOrder.customer_id;
  result.technician_id = typeof workOrder.technicianId !== 'string' ? workOrder.technicianId : workOrder.technician_id;
  result.vehicle_id = workOrder.vehicleId || workOrder.vehicle_id;
  result.location = workOrder.location;
  result.notes = workOrder.notes || '';
  result.end_time = workOrder.dueDate; // Map dueDate to end_time for database
  result.priority = workOrder.priority;
  result.total_cost = workOrder.totalCost || workOrder.total_cost || 0;
  result.service_type = workOrder.serviceType || workOrder.service_type;
  result.service_category = workOrder.serviceCategory || workOrder.service_category;
  result.estimated_hours = workOrder.estimatedHours || workOrder.estimated_hours || null;

  return result;
};

// Helper function to determine priority based on work order properties
export const determinePriority = (workOrder: any): WorkOrderPriorityType => {
  // If the priority is already set, use it
  if (workOrder.priority) {
    if (["low", "medium", "high"].includes(workOrder.priority)) {
      return workOrder.priority as WorkOrderPriorityType;
    }
  }
  
  // Default to medium priority if not set
  return "medium";
};

// Export enumeration for WorkOrderStatus to be used consistently
export enum WorkOrderStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
  Cancelled = "cancelled"
}
