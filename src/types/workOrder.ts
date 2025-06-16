

export interface WorkOrder {
  id: string;
  shop_id?: string; // Make optional since database might not return it
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_license_plate?: string;
  vehicle_vin?: string;
  odometer?: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  technician_id?: string;
  location?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  inventory_items?: WorkOrderInventoryItem[];

  // Database fields that components are expecting
  work_order_number?: string;
  total_cost?: number;
  service_type?: string;
  estimated_hours?: number;
  total_billable_time?: number;
  date?: string; // For compatibility
  customer?: string; // For compatibility - should map to customer_name
  vehicle?: any; // For compatibility
  advisor_id?: string;
  created_by?: string;
  end_time?: string;
  start_time?: string;
  invoice_id?: string;
  invoiced_at?: string;
  timeEntries?: TimeEntry[];

  // CamelCase aliases for backward compatibility
  shopId?: string; // Alias for shop_id
  customerId?: string; // Alias for customer_id
  customerName?: string; // Alias for customer_name
  customerEmail?: string; // Alias for customer_email
  customerPhone?: string; // Alias for customer_phone
  customerAddress?: string; // Alias for customer_address
  vehicleId?: string; // Alias for vehicle_id
  vehicleMake?: string; // Alias for vehicle_make
  vehicleModel?: string; // Alias for vehicle_model
  vehicleYear?: string; // Alias for vehicle_year
  vehicleLicensePlate?: string; // Alias for vehicle_license_plate
  vehicleVin?: string; // Alias for vehicle_vin
  technicianId?: string; // Alias for technician_id
  dueDate?: string; // Alias for due_date
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
  inventoryItems?: WorkOrderInventoryItem[]; // Alias for inventory_items
}

export interface WorkOrderJobLine {
  id: string;
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: string;
  total_amount?: number;
  status?: string;
  notes?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  inventory_item_id?: string;
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  markup_percentage?: number;
  vendor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
  itemStatus?: string;
  estimatedArrivalDate?: string; // Added missing property
}

// Add missing TimeEntry interface
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

// Updated WorkOrderTemplate interface with all expected properties
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status?: string; // Added missing property
  priority?: string; // Added missing property
  technician?: string; // Added missing property
  notes?: string;
  location?: string;
  inventory_items?: WorkOrderInventoryItem[]; // Added missing property
  last_used?: string; // Added missing property
  usage_count?: number; // Added missing property
  jobLines?: any[];
  parts?: any[];
  estimatedHours?: number;
  laborRate?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderFormValues {
  customer: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  vin?: string;
  odometer?: string;
  description: string;
  status: string;
  priority: string;
  technician?: string;
  technicianId?: string;
  location?: string;
  dueDate?: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[]; // Added missing property
}

export const WORK_ORDER_STATUSES = [
  'pending',
  'in-progress', 
  'on-hold',
  'completed',
  'cancelled',
  'body-shop',
  'mobile-service',
  'needs-road-test',
  'parts-requested',
  'parts-ordered',
  'parts-arrived',
  'customer-to-return',
  'rebooked',
  'foreman-signoff-waiting',
  'foreman-signoff-complete',
  'sublet',
  'waiting-customer-auth',
  'po-requested',
  'tech-support',
  'warranty',
  'internal-ro'
] as const;

export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];

export const statusMap: Record<WorkOrderStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'on-hold': 'On Hold',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'body-shop': 'Body Shop',
  'mobile-service': 'Mobile Service',
  'needs-road-test': 'Needs Road Test',
  'parts-requested': 'Parts Requested',
  'parts-ordered': 'Parts Ordered',
  'parts-arrived': 'Parts Arrived',
  'customer-to-return': 'Customer to Return',
  'rebooked': 'Rebooked',
  'foreman-signoff-waiting': 'Foreman Sign-off Waiting',
  'foreman-signoff-complete': 'Foreman Sign-off Complete',
  'sublet': 'Sublet',
  'waiting-customer-auth': 'Waiting for Customer Auth',
  'po-requested': 'PO Requested',
  'tech-support': 'Tech Support',
  'warranty': 'Warranty',
  'internal-ro': 'Internal RO'
};

// Add missing priorityMap export
export const priorityMap: Record<string, { label: string; classes: string }> = {
  'low': {
    label: 'Low',
    classes: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'medium': {
    label: 'Medium',
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  'high': {
    label: 'High',
    classes: 'bg-red-100 text-red-800 border-red-200'
  },
  'urgent': {
    label: 'Urgent',
    classes: 'bg-red-200 text-red-900 border-red-300'
  }
};

