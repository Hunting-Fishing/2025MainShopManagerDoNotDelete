
// Define the inventory item interface for work orders
export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  itemStatus?: 'in-stock' | 'ordered' | 'special-order' | 'used-part' | 'misc';
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  notes?: string;
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

// Define work order template interface
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  customer?: string;
  location?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

// Add the WorkOrder interface, using required fields to avoid conflicts
export interface WorkOrder {
  id: string;
  customer: string;
  description: string; // Make description required to avoid interface conflicts
  status: string;
  date?: string;
  dueDate?: string;
  priority?: string;
  technician: string;
  location?: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
  // Add any other fields needed
  service_type?: string;
  customer_id?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  created_at?: string;
  updated_at?: string;
  technician_id?: string;
  total_cost?: number;
  estimated_hours?: number;
}
