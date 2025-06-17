
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
  inventory_items?: any[];
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

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'pending',
  'in_progress', 
  'completed',
  'cancelled',
  'on_hold'
];

// Status mapping for UI display
export const statusMap: Record<string, string> = {
  'pending': 'Pending',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'on_hold': 'On Hold'
};

// Priority mapping for UI display
export const priorityMap: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent'
};
