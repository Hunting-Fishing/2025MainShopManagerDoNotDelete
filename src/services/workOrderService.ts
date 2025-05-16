
import { WorkOrder, TimeEntry } from "@/types/workOrder";

/**
 * Fetch a work order by its ID
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder> => {
  // In a real app, this would call an API
  // For now, simulate a delay and return a mock work order
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    id: id,
    title: `Work Order #${id}`,
    description: "Sample work order description",
    status: "in-progress",
    priority: "medium",
    customer: {
      id: "cust-123",
      name: "John Smith",
      email: "john@example.com",
      phone: "555-123-4567"
    },
    vehicle: {
      id: "veh-123",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      vin: "1HGCM82633A123456"
    },
    assignedTo: ["tech-1", "tech-2"],
    created_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 4,
    completion_date: null
  };
};

/**
 * Update a work order
 */
export const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> => {
  // In a real app, this would call an API
  // For now, simulate a delay and return the updated work order
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get the work order (in a real app, this would fetch from API)
  const workOrder = await getWorkOrderById(id);
  
  // Apply updates
  const updatedWorkOrder = {
    ...workOrder,
    ...updates,
  };
  
  return updatedWorkOrder;
};

/**
 * Add a time entry to a work order
 */
export const addTimeEntry = async (workOrderId: string, entry: Omit<TimeEntry, "id">): Promise<TimeEntry> => {
  // In a real app, this would call an API
  // For now, simulate a delay and return the new time entry
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newEntry: TimeEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };
  
  return newEntry;
};

/**
 * Update a time entry
 */
export const updateTimeEntry = async (workOrderId: string, entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
  // In a real app, this would call an API
  // For now, simulate a delay and return the updated entry
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock updated entry
  return {
    id: entryId,
    employee_name: updates.employee_name || "John Doe",
    date: updates.date || new Date().toISOString(),
    start_time: updates.start_time || "09:00",
    duration: updates.duration || 60,
    description: updates.description || "Service work",
    billable: updates.billable !== undefined ? updates.billable : true,
    billable_rate: updates.billable_rate || 85
  };
};

/**
 * Delete a time entry
 */
export const deleteTimeEntry = async (workOrderId: string, entryId: string): Promise<boolean> => {
  // In a real app, this would call an API
  // For now, simulate a delay and return success
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};
