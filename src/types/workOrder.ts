
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
