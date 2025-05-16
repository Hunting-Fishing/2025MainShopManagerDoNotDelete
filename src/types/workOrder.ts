
export type WorkOrderStatusType = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'on-hold';

export interface WorkOrder {
  id: string;
  customer_id?: string;
  vehicle_id?: string;
  advisor_id?: string;
  technician_id?: string;
  estimated_hours?: number;
  total_cost?: number;
  status: WorkOrderStatusType;
  description?: string;
  service_type?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  start_time?: string; 
  end_time?: string;
  service_category_id?: string;
  invoiced_at?: string;
  invoice_id?: string;
  vehicle_year?: string | number;
  // Adding missing fields
  customer?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  timeEntries?: TimeEntry[];
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status?: WorkOrderStatusType;
  priority?: string;
  technician?: string;
  notes?: string;
  last_used?: string;
  usage_count: number;
  created_at?: string;
}

export interface TimeEntry {
  id: string;
  work_order_id: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time?: string;
  duration: number; // in minutes
  billable: boolean;
  notes?: string;
  created_at?: string;
}

export type WorkOrderUpdater = (workOrder: Partial<WorkOrder>) => Partial<WorkOrder>;

// Define types needed by equipment components
export type WorkOrderPriorityType = 'low' | 'medium' | 'high' | 'critical';
export enum WorkOrderTypes {
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  DIAGNOSTIC = 'diagnostic',
  OTHER = 'other'
}
