
export interface WorkOrder {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city?: string; // Added missing property
  customer_state?: string; // Added missing property
  vehicle_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_license_plate: string;
  vehicle_vin: string;
  vehicle_odometer: number;
  description: string;
  status: string;
  priority: string;
  technician_id: string;
  technician: string;
  location: string;
  due_date: string;
  notes: string;
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
  vehicleOdometer?: number; // Alias for vehicle_odometer
  technicianId?: string; // Alias for technician_id
  dueDate?: string; // Alias for due_date
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
  inventoryItems?: WorkOrderInventoryItem[]; // Alias for inventory_items
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
  itemStatus?: string; // Added missing property
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

// Add missing WorkOrderTemplate interface
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  jobLines: any[];
  parts: any[];
  estimatedHours: number;
  laborRate: number;
  created_at: string;
  updated_at: string;
}

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
}

// Work Order Status Types - Updated to include all new statuses
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

export type WorkOrderStatusType = typeof WORK_ORDER_STATUSES[number];

// Legacy alias for backward compatibility
export type WorkOrderStatus = WorkOrderStatusType;

// Priority Types
export const WORK_ORDER_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type WorkOrderPriorityType = typeof WORK_ORDER_PRIORITIES[number];

// Status mapping for UI display with colors
export const statusMap: Record<WorkOrderStatusType, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-100 text-orange-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'body-shop': { label: 'Body Shop', classes: 'bg-purple-100 text-purple-800' },
  'mobile-service': { label: 'Mobile Service', classes: 'bg-indigo-100 text-indigo-800' },
  'needs-road-test': { label: 'Needs Road Test', classes: 'bg-cyan-100 text-cyan-800' },
  'parts-requested': { label: 'Parts Requested', classes: 'bg-amber-100 text-amber-800' },
  'parts-ordered': { label: 'Parts Ordered', classes: 'bg-orange-100 text-orange-800' },
  'parts-arrived': { label: 'Parts Arrived', classes: 'bg-lime-100 text-lime-800' },
  'customer-to-return': { label: 'Customer to Return', classes: 'bg-pink-100 text-pink-800' },
  'rebooked': { label: 'Rebooked', classes: 'bg-violet-100 text-violet-800' },
  'foreman-signoff-waiting': { label: 'Foreman Sign-off Waiting', classes: 'bg-yellow-100 text-yellow-800' },
  'foreman-signoff-complete': { label: 'Foreman Sign-off Complete', classes: 'bg-emerald-100 text-emerald-800' },
  'sublet': { label: 'Sublet', classes: 'bg-teal-100 text-teal-800' },
  'waiting-customer-auth': { label: 'Waiting for Customer Auth', classes: 'bg-red-100 text-red-800' },
  'po-requested': { label: 'PO Requested', classes: 'bg-slate-100 text-slate-800' },
  'tech-support': { label: 'Tech Support', classes: 'bg-blue-100 text-blue-800' },
  'warranty': { label: 'Warranty', classes: 'bg-green-100 text-green-800' },
  'internal-ro': { label: 'Internal RO', classes: 'bg-gray-100 text-gray-800' }
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
