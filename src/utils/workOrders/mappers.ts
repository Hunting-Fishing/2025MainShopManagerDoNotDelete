
import { WorkOrder, TimeEntry, DbTimeEntry } from '@/types/workOrder';

// Map database model to application model
export const mapDatabaseToAppModel = (dbData: any): WorkOrder => {
  // Extract time entries if available
  const timeEntries = dbData.work_order_time_entries 
    ? dbData.work_order_time_entries.map(mapTimeEntryFromDb)
    : [];

  // Map the database model to the application model
  return {
    id: dbData.id,
    customer: dbData.customers ? `${dbData.customers.first_name} ${dbData.customers.last_name}`.trim() : 'Unknown',
    customer_id: dbData.customer_id,
    description: dbData.description || '',
    status: dbData.status || 'pending',
    priority: dbData.priority || 'medium',
    technician: dbData.profiles ? `${dbData.profiles.first_name} ${dbData.profiles.last_name}`.trim() : 'Unassigned',
    technician_id: dbData.technician_id,
    date: dbData.created_at,
    dueDate: dbData.due_date || '',
    location: dbData.location || '',
    notes: dbData.notes || '',
    inventoryItems: dbData.inventory_items || [],
    timeEntries: timeEntries,
    totalBillableTime: timeEntries.reduce((total, entry) => 
      entry.billable ? total + entry.duration : total, 0),
    createdAt: dbData.created_at,
    lastUpdatedAt: dbData.updated_at,
    vehicle_id: dbData.vehicle_id,
    vehicle_make: dbData.vehicle_make,
    vehicle_model: dbData.vehicle_model,
    service_type: dbData.service_type,
    service_category: dbData.service_category,
    service_category_id: dbData.service_category_id,
    total_cost: dbData.total_cost,
    estimated_hours: dbData.estimated_hours,
    // Add other fields as necessary
  };
};

// Map application model to database model
export const mapAppModelToDatabase = (workOrder: WorkOrder): any => {
  return {
    id: workOrder.id,
    customer_id: workOrder.customer_id,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    technician_id: workOrder.technician_id,
    due_date: workOrder.dueDate,
    location: workOrder.location,
    notes: workOrder.notes,
    vehicle_id: workOrder.vehicle_id,
    service_type: workOrder.serviceType || workOrder.service_type,
    service_category_id: workOrder.service_category_id,
    total_cost: workOrder.total_cost,
    estimated_hours: workOrder.estimated_hours,
    // Add other fields as necessary but omit timeEntries and inventoryItems
    // as they are typically stored in separate tables
  };
};

// Map database time entry to application time entry
export const mapTimeEntryFromDb = (dbEntry: DbTimeEntry): TimeEntry => {
  return {
    id: dbEntry.id,
    employeeId: dbEntry.employee_id,
    employeeName: dbEntry.employee_name,
    startTime: dbEntry.start_time,
    endTime: dbEntry.end_time,
    duration: dbEntry.duration,
    notes: dbEntry.notes,
    billable: dbEntry.billable
  };
};

// Map application time entry to database time entry
export const mapTimeEntryToDb = (entry: TimeEntry, workOrderId: string): DbTimeEntry => {
  return {
    id: entry.id,
    employee_id: entry.employeeId,
    employee_name: entry.employeeName,
    start_time: entry.startTime,
    end_time: entry.endTime,
    duration: entry.duration,
    notes: entry.notes,
    billable: entry.billable,
    work_order_id: workOrderId
  };
};
