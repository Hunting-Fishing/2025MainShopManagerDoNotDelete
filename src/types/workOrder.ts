
// Define the inventory item interface for work orders
export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

// Define the time entry interface for work order time tracking
export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string; // ISO string
  endTime: string | null; // ISO string, null if ongoing
  duration: number; // in minutes
  notes?: string;
  billable: boolean;
}

// Other types related to work orders can be added here
