
export type WorkOrderStatusType = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
export type WorkOrderPriorityType = 'low' | 'medium' | 'high';

export interface TimeEntry {
  id: string;
  employee_id: string;
  employeeId?: string; // Alias for employee_id
  employeeName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  notes?: string;
  billable?: boolean;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface WorkOrder {
  id: string;
  customer_id?: string;
  customer?: string;
  vehicle_id?: string;
  status: WorkOrderStatusType;
  description?: string;
  total_cost?: number;
  created_at: string;
  updated_at: string;
  technician_id?: string;
  service_type?: string;
  service_category_id?: string;
  
  // Added fields commonly used in components
  date?: string;            // Alias for created_at
  createdAt?: string;       // Alias for created_at
  dueDate?: string;         // Derived field
  due_date?: string;        // Database field
  priority?: WorkOrderPriorityType;
  technician?: string;      // Derived field
  location?: string;        // Additional field
  notes?: string;           // Additional field
  timeEntries?: TimeEntry[];
  inventoryItems?: WorkOrderInventoryItem[];
  totalBillableTime?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  odometer?: string;
  licensePlate?: string;
  vin?: string;
  serviceCategory?: string;
  vehicleDetails?: any;
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  technician?: string;
  technician_id?: string;
  notes?: string;
  last_used?: string;
  usage_count?: number;
  location?: string;
  customer?: string;
  customer_id?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}
