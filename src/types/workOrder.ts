
// Work Order Types - Standardized to match database schema (snake_case)

import { WorkOrderJobLine } from './jobLine';

export interface WorkOrder {
  id: string;
  work_order_number?: string; // NEW: Work order number field
  customer_id?: string;
  vehicle_id?: string;
  advisor_id?: string;
  technician_id?: string;
  estimated_hours?: number;
  total_cost?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  service_category_id?: string;
  invoiced_at?: string;
  status: string;
  description?: string;
  service_type?: string;
  invoice_id?: string;
  // Additional UI properties for backward compatibility
  customer?: string;
  technician?: string;
  date?: string;
  dueDate?: string;
  due_date?: string;
  priority?: string;
  location?: string;
  notes?: string;
  total_billable_time?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string;
  // Customer information
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  // Company information
  company_name?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_zip?: string;
  company_phone?: string;
  company_email?: string;
  company_logo?: string;
  // Additional fields for UI
  timeEntries?: TimeEntry[];
  inventoryItems?: WorkOrderInventoryItem[];
  inventory_items?: WorkOrderInventoryItem[];
  // Job Lines - NEW
  jobLines?: WorkOrderJobLine[];
  // NEW: Vehicle object from vehicle table join
  vehicle?: {
    id: string;
    year?: number | string;
    make?: string;
    model?: string;
    vin?: string;
    license_plate?: string;
    trim?: string;
  };
  // Invoice calculations
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount?: number;
}

// Work Order Form Values - Used by form components
export interface WorkOrderFormValues {
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "on-hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  technician: string;
  location: string;
  dueDate: string;
  notes: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  odometer?: string;
  licensePlate?: string;
  vin?: string;
  inventoryItems: WorkOrderInventoryItem[];
}

// Inventory item within a work order
export interface WorkOrderInventoryItem {
  id: string;
  workOrderId?: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
  itemStatus?: "special-order" | "ordered" | "in-stock";
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
}

// Time tracking entry
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
  created_at: string;
}

// Work Order Template interface
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  notes?: string;
  location?: string;
  inventory_items?: WorkOrderInventoryItem[];
  usage_count: number;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

// Work order status options
export const WORK_ORDER_STATUSES = [
  'pending',
  'in-progress', 
  'on-hold',
  'completed',
  'cancelled'
] as const;

export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];

// Work order priority options
export const WORK_ORDER_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export type WorkOrderPriority = typeof WORK_ORDER_PRIORITIES[number];

// Status mapping for UI display
export const statusMap: Record<string, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'on-hold': 'On Hold',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

// Priority mapping for UI display
export const priorityMap: Record<string, { label: string; classes: string }> = {
  'low': { label: 'Low', classes: 'bg-gray-100 text-gray-800' },
  'medium': { label: 'Medium', classes: 'bg-yellow-100 text-yellow-800' },
  'high': { label: 'High', classes: 'bg-red-100 text-red-800' },
  'urgent': { label: 'Urgent', classes: 'bg-red-200 text-red-900' }
};

// Legacy type aliases for backward compatibility
export type WorkOrderPriorityType = WorkOrderPriority;
export type WorkOrderStatusType = WorkOrderStatus;
export type WorkOrderFormSchemaValues = WorkOrderFormValues;

// Export for backward compatibility
export const WorkOrderTypes = {
  WORK_ORDER_STATUSES,
  WORK_ORDER_PRIORITIES,
  statusMap,
  priorityMap
};
