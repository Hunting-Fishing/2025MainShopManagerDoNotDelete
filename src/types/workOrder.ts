
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
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

// Define a comprehensive WorkOrder interface that works for both UI and API
export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  date: string;
  dueDate: string;
  location: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  
  // Database field format (snake_case)
  customer_id?: string;
  vehicle_id?: string;
  
  // Client-side aliases (camelCase)
  vehicleId?: string;
  vehicle_make?: string;
  vehicleMake?: string;
  vehicle_model?: string;
  vehicleModel?: string;
  vehicle_year?: string;
  vehicleYear?: string;
  
  technician_id?: string;
  total_cost?: number;
  estimated_hours?: number;
  service_type?: string;
  service_category?: string;
  serviceCategory?: string;
  
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
  
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    odometer?: string;
    licensePlate?: string;
  };
}

// Define status map type
export type WorkOrderStatusType = "pending" | "in-progress" | "completed" | "cancelled";

// Define priority map type
export type WorkOrderPriorityType = "low" | "medium" | "high";
