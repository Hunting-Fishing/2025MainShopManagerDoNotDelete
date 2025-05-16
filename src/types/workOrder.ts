
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

// Database version of TimeEntry (snake_case)
export interface DbTimeEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  notes?: string;
  billable: boolean;
  work_order_id: string;
  created_at?: string;
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
  status: WorkOrderStatusType;
  priority: WorkOrderPriorityType;
  technician: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

// Define a comprehensive WorkOrder interface that works for both UI and API
export interface WorkOrder {
  id: string;
  // Customer info
  customerId?: string;
  customer_id?: string;
  customer: string; // Display name
  
  // Basic info
  description: string;
  status: WorkOrderStatusType;
  priority: WorkOrderPriorityType;
  
  // Personnel
  technician: string;
  technicianId?: string;
  technician_id?: string;
  
  // Dates
  date: string;
  createdAt?: string;
  created_at?: string;
  dueDate: string;
  updatedAt?: string;
  lastUpdatedAt?: string; // For backward compatibility
  updated_at?: string;
  
  // Location
  location: string;
  
  // Notes
  notes?: string;
  
  // Items and entries
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
  
  // Meta information
  createdBy?: string;
  lastUpdatedBy?: string;
  
  // Vehicle information
  vehicleId?: string;
  vehicle_id?: string;
  vehicleMake?: string;
  vehicle_make?: string;
  vehicleModel?: string;
  vehicle_model?: string;
  vehicleYear?: string;
  vehicle_year?: string;
  
  // Financial info
  totalCost?: number;
  total_cost?: number;
  estimated_hours?: number;
  estimatedHours?: number;
  
  // Service info
  serviceType?: string;
  service_type?: string;
  serviceCategory?: string;
  service_category?: string;
  
  // Added vehicle-related fields for form consistency
  odometer?: string;
  licensePlate?: string;
  vin?: string;
  
  // Additional vehicle fields from VIN decoding
  driveType?: string;
  transmission?: string;
  fuelType?: string;
  engine?: string;
  bodyStyle?: string;
  country?: string;
  
  // Vehicle details as an object
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    odometer?: string;
    licensePlate?: string;
  };
}

// Define status types
export type WorkOrderStatusType = "pending" | "in-progress" | "completed" | "cancelled";

// Define priority types
export type WorkOrderPriorityType = "low" | "medium" | "high";

// Export status map for UI display
export const statusMap: Record<WorkOrderStatusType, string> = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Export priority map for UI display
export const priorityMap: Record<WorkOrderPriorityType, { label: string; classes: string; }> = {
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
