
export type WorkOrderStatusType = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold' | 'waiting-parts' | 'waiting-approval';
export type WorkOrderPriorityType = 'high' | 'medium' | 'low';

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  notes?: string;
}

export interface TimeEntry {
  id: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  billable: boolean;
  notes?: string;
}

export interface DbTimeEntry {
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

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  itemStatus?: string;
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  customer?: string;
  customer_id?: string;
  vehicle_id?: string;
  technician_id?: string;
  advisor_id?: string;
  status: WorkOrderStatusType;
  priority: WorkOrderPriorityType;
  description?: string;
  service_type?: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  estimated_hours?: number;
  total_cost?: number;
  service_category_id?: string;
  invoiced_at?: string;
  invoice_id?: string;
  created_by?: string;
}

// Map status values to human-readable labels
export const statusMap = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'on-hold': 'On Hold',
  'waiting-parts': 'Waiting for Parts',
  'waiting-approval': 'Waiting for Approval'
};

// Map priority values to human-readable labels
export const priorityMap = {
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low'
};
