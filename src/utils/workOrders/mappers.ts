
import { WorkOrder, TimeEntry, DbTimeEntry, WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";

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
    description: data.description || '',
    status: typedStatus,
    priority: determinePriority(data) as WorkOrderPriorityType,
    technician: technicianName || 'Unassigned',
    location: data.location || '',
    dueDate: data.end_time || data.created_at || '',
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
  };
  
  // Handle service category safely
  if (data.service_category !== undefined) {
    workOrder.serviceCategory = data.service_category;
    workOrder.service_category = data.service_category;
  }
  
  return workOrder;
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

  // Standard fields
  result.description = workOrder.description;
  result.status = workOrder.status;
  result.customer_id = typeof workOrder.customer !== 'string' ? workOrder.customer : null;
  result.technician_id = typeof workOrder.technician !== 'string' ? workOrder.technician : null;
  result.location = workOrder.location;
  result.notes = workOrder.notes || '';
  result.end_time = workOrder.dueDate; // Map dueDate to end_time for database
  result.priority = workOrder.priority;
  result.total_cost = workOrder.total_cost || 0;
  result.estimated_hours = workOrder.estimated_hours || null;

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

// Export status and priority mappings for UI consistency
export const statusMap: Record<string, string> = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

export const priorityMap: Record<string, { label: string; classes: string; }> = {
  "low": {
    label: "Low",
    classes: "bg-slate-100 text-slate-700"
  },
  "medium": {
    label: "Medium",
    classes: "bg-blue-100 text-blue-700"
  },
  "high": {
    label: "High", 
    classes: "bg-red-100 text-red-700"
  }
};
