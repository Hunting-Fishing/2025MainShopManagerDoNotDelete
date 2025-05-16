
import { Customer } from "./customer";
import { Vehicle } from "./vehicle";
import { InventoryItem } from "./inventory";

export type WorkOrderStatusType = 
  | "pending" 
  | "in-progress" 
  | "on-hold" 
  | "completed" 
  | "cancelled";

export type WorkOrderPriorityType = 
  | "low" 
  | "medium" 
  | "high";

// Main WorkOrder interface with consistent property naming
export interface WorkOrder {
  id: string;
  customer: string;
  customer_id?: string;
  vehicle_id?: string;
  description?: string;
  service_type?: string;
  status: WorkOrderStatusType;
  priority: WorkOrderPriorityType;
  date?: string;
  dueDate?: string; // Keep this legacy camelCase property
  due_date?: string; // And the snake_case version for consistency
  technician?: string;
  technician_id?: string;
  location?: string;
  notes?: string;
  createdAt?: string; // Legacy camelCase property 
  created_at?: string; // Snake_case version
  updatedAt?: string; // Legacy camelCase property
  updated_at?: string; // Snake_case version
  invoice_id?: string;
  total_cost?: number;
  estimated_hours?: number;
  timeEntries?: TimeEntry[];
  time_entries?: TimeEntry[];
  totalBillableTime?: number;
  total_billable_time?: number;
  inventory_items?: WorkOrderInventoryItem[];
  inventoryItems?: WorkOrderInventoryItem[];
  customerData?: Customer;
  vehicleData?: Vehicle;
  vehicle_make?: string;
  vehicle_model?: string;
  service_category?: string; // Add missing service_category property
}

export interface TimeEntry {
  id: string;
  work_order_id: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time?: string;
  duration: number;
  billable: boolean;
  notes?: string;
  created_at?: string;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  workOrderId?: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
  itemStatus?: string;
  estimatedArrivalDate?: string;
  supplierName?: string;
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status: WorkOrderStatusType;
  priority?: WorkOrderPriorityType;
  technician?: string;
  notes?: string;
  location?: string;
  created_at?: string;
  last_used?: string;
  lastUsed?: string; // Alias for compatibility
  usage_count?: number;
  items?: WorkOrderInventoryItem[];
  inventory_items?: WorkOrderInventoryItem[];
}

// Define Work Order Types
export const WorkOrderTypes = {
  REPAIR: "repair",
  MAINTENANCE: "maintenance",
  INSPECTION: "inspection",
  DIAGNOSTICS: "diagnostics",
  OTHER: "other"
};

export interface WorkOrderFormSchemaValues {
  customer: string;
  description: string;
  status: string;
  priority: string;
  technician: string;
  location: string;
  dueDate: Date | string;
  notes: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  odometer: string;
  licensePlate: string;
  vin: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

export interface WorkOrderFormValues {
  estimated_hours: number;
  status: WorkOrderStatusType;
  description: string;
  service_type: string;
  customer: string;
  location: string;
  notes: string;
  priority: WorkOrderPriorityType;
  dueDate: string;
  technician: string;
  technician_id: string;
  inventoryItems: WorkOrderInventoryItem[];
}

export const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

export const priorityMap = {
  "low": {
    label: "Low",
    classes: "bg-blue-100 text-blue-800 border-blue-200"
  },
  "medium": {
    label: "Medium",
    classes: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  "high": {
    label: "High",
    classes: "bg-red-100 text-red-800 border-red-200"
  }
};
