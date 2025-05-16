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
  location?: string;
  createdAt?: string;
  usageCount?: number;
  lastUsed?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string; // Add employeeId field
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
  
  // Additional fields to match component usage
  date?: string;
  dueDate?: string;
  createdAt?: string;
  technician?: string;
  location?: string;
  notes?: string;
  totalBillableTime?: number;
  timeEntries?: TimeEntry[];
  inventoryItems?: WorkOrderInventoryItem[];
  vehicle_make?: string;
  vehicle_model?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  serviceCategory?: string;
  odometer?: string;
  licensePlate?: string;
  vin?: string;
  vehicleDetails?: {
    year?: string;
    [key: string]: any;
  };
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
  'high': {
    label: 'High',
    classes: 'bg-red-100 text-red-800 border border-red-200'
  },
  'medium': {
    label: 'Medium',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  },
  'low': {
    label: 'Low',
    classes: 'bg-green-100 text-green-800 border border-green-200'
  }
};
