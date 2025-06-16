import { Customer } from "./customer";

export interface WorkOrder {
  // Core identifiers
  id: string;
  shop_id?: string;
  
  // Customer information
  customer_id?: string;
  customer_name?: string;
  customer?: string; // backward compatibility
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  
  // Vehicle information
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string; // Added missing property
  vehicle?: string; // backward compatibility
  
  // Work order details
  work_order_number?: string;
  description?: string;
  status: WorkOrderStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  service_type?: string;
  service_category_id?: string; // Added missing property
  
  // Assignment and scheduling
  advisor_id?: string;
  technician_id?: string;
  technician?: string; // backward compatibility
  location?: string;
  estimated_hours?: number;
  
  // Financial
  total_cost?: number;
  invoice_id?: string;
  invoiced_at?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  start_time?: string;
  end_time?: string;
  date?: string; // backward compatibility
  dueDate?: string; // backward compatibility
  due_date?: string;
  
  // Additional data
  notes?: string;
  total_billable_time?: number;
  
  // Related data
  timeEntries?: TimeEntry[];
  inventoryItems?: WorkOrderInventoryItem[];
  inventory_items?: WorkOrderInventoryItem[]; // backward compatibility
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
  estimatedArrivalDate?: string;
  supplierName?: string; // Added missing property
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  notes?: string;
  usage_count?: number;
  last_used?: string;
  inventory_items?: WorkOrderInventoryItem[];
  created_at: string; // Added missing property
  updated_at: string; // Added missing property
}

export interface TimeEntry {
  id: string;
  work_order_id: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  notes?: string;
  billable?: boolean;
  created_at: string;
}

export type WorkOrderStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'on-hold' 
  | 'completed' 
  | 'cancelled'
  | 'body-shop'
  | 'mobile-service'
  | 'needs-road-test'
  | 'parts-requested'
  | 'parts-ordered'
  | 'parts-arrived'
  | 'customer-to-return'
  | 'rebooked'
  | 'foreman-signoff-waiting'
  | 'foreman-signoff-complete'
  | 'sublet'
  | 'waiting-customer-auth'
  | 'po-requested'
  | 'tech-support'
  | 'warranty'
  | 'internal-ro';

// Export WorkOrderStatusType as alias for backward compatibility
export type WorkOrderStatusType = WorkOrderStatus;

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_link: string;
  average_rating: number;
  review_count: number;
  category: string;
  manufacturer: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  main_category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceJob {
  id: string;
  name: string;
  description: string;
  estimated_hours: number;
  price: number;
  subcategory_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceSector {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  categories: ServiceMainCategory[];
}

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

export const WORK_ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'body-shop', label: 'Body Shop' },
  { value: 'mobile-service', label: 'Mobile Service' },
  { value: 'needs-road-test', label: 'Needs Road Test' },
  { value: 'parts-requested', label: 'Parts Requested' },
  { value: 'parts-ordered', label: 'Parts Ordered' },
  { value: 'parts-arrived', label: 'Parts Arrived' },
  { value: 'customer-to-return', label: 'Customer to Return' },
  { value: 'rebooked', label: 'Rebooked' },
  { value: 'foreman-signoff-waiting', label: 'Foreman Sign-off Waiting' },
  { value: 'foreman-signoff-complete', label: 'Foreman Sign-off Complete' },
  { value: 'sublet', label: 'Sublet' },
  { value: 'waiting-customer-auth', label: 'Waiting for Customer Auth' },
  { value: 'po-requested', label: 'PO Requested' },
  { value: 'tech-support', label: 'Tech Support' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'internal-ro', label: 'Internal RO' }
];

export const statusMap: Record<WorkOrderStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'on-hold': 'On Hold',
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
