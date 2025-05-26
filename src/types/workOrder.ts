
// Work Order Types - Standardized to match database schema (snake_case)
export interface WorkOrder {
  id: string;
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
  // Additional fields for UI
  timeEntries?: TimeEntry[];
  inventoryItems?: WorkOrderInventoryItem[];
}

// Work Order Form Values - Used by form components
export interface WorkOrderFormValues {
  customer: string;
  description: string;
  status: string;
  priority: string;
  technician: string;
  location: string;
  dueDate: string;
  notes: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  odometer: string;
  licensePlate: string;
  vin: string;
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
