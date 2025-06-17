
export interface WorkOrder {
  id: string;
  customer_id?: string;
  vehicle_id?: string;
  advisor_id?: string;
  technician_id?: string;
  technician?: string;
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
  work_order_number?: string;
  
  // Extended properties for UI components
  customer?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  priority?: string;
  due_date?: string;
  location?: string;
  notes?: string;
  total_billable_time?: string | number;
  date?: string;
  
  // Vehicle information
  vehicle_year?: string | number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string | number;
  
  // Related data
  timeEntries?: TimeEntry[];
  inventory_items?: WorkOrderInventoryItem[];
  
  // Legacy compatibility aliases
  dueDate?: string; // Maps to due_date
  inventoryItems?: WorkOrderInventoryItem[]; // Maps to inventory_items
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
  quantity: number;
  unit_price: number;
  total: number;
  itemStatus?: string;
}

export interface WorkOrderVehicle {
  id?: string;
  year?: string | number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  odometer?: string | number;
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  estimated_hours?: number;
  labor_rate?: number;
  parts?: WorkOrderPart[];
  created_at: string;
  updated_at: string;
  status?: string;
  priority?: string;
  technician?: string;
  notes?: string;
  location?: string;
  inventory_items?: WorkOrderInventoryItem[];
  last_used?: string;
  usage_count?: number;
}

export interface WorkOrderFormValues {
  description: string;
  customer: string;
  status: string;
  priority: string;
  dueDate: string;
  technician: string;
  location: string;
  notes: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  vin?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'pending',
  'in_progress', 
  'completed',
  'cancelled',
  'on_hold'
];

// Status mapping for UI display
export const statusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in_progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'on_hold': { label: 'On Hold', classes: 'bg-gray-100 text-gray-800' }
};

// Priority mapping for UI display
export const priorityMap: Record<string, { label: string; classes: string }> = {
  'low': { label: 'Low', classes: 'bg-green-100 text-green-800' },
  'medium': { label: 'Medium', classes: 'bg-yellow-100 text-yellow-800' },
  'high': { label: 'High', classes: 'bg-orange-100 text-orange-800' },
  'urgent': { label: 'Urgent', classes: 'bg-red-100 text-red-800' }
};
