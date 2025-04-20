
import { ReactNode } from 'react';

// Define the inventory item interface for work orders
export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  itemStatus?: 'in-stock' | 'ordered' | 'special-order' | 'used-part' | 'misc';
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  notes?: string;
}

// Define the time entry interface for work order time tracking
export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string; // ISO string
  endTime: string | null; // ISO string, null if ongoing
  duration: number; // in minutes
  notes?: string;
  billable: boolean;
}

// Database version of TimeEntry (snake_case)
export interface DbTimeEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  notes?: string;
  billable: boolean;
  work_order_id: string;
  created_at?: string;
}

// Define work order template interface
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  customer?: string;
  location?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
}

// Define a comprehensive WorkOrder interface that works for both UI and API
export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  date: string;
  dueDate: string;
  location: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  startTime?: string; // For analytics components
  endTime?: string;   // For analytics components
  // Database field format (snake_case)
  customer_id?: string;
  vehicle_id?: string;
  // Client-side aliases (camelCase)
  vehicleId?: string;
  vehicle_make?: string;
  vehicleMake?: string;
  vehicle_model?: string;
  vehicleModel?: string;
  technician_id?: string;
  total_cost?: number;
  estimated_hours?: number;
  service_type?: string;
  serviceType?: string; 
  service_category?: string;
  serviceCategory?: string;
  service_category_id?: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    odometer?: string;
    licensePlate?: string;
  };
  // Invoice fields
  invoice_id?: string;
  invoiced_at?: string;
}

// For form handling
export interface WorkOrderFormFieldValues {
  customer: string;
  location: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  technician: string;
  dueDate: Date | string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  [key: string]: any;
}

export interface WorkOrderFormValues {
  id: string;
  customer: string;
  customer_id?: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  technician_id?: string;
  date?: string;
  dueDate: string;
  location: string;
  notes?: string;
  vehicle_id?: string;
  serviceCategory?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
}

// Define status map type
export type WorkOrderStatusType = "pending" | "in-progress" | "completed" | "cancelled";

// Define priority map type
export type WorkOrderPriorityType = "low" | "medium" | "high";

// Define search parameters for work orders
export interface WorkOrderSearchParams {
  status?: string[];
  priority?: string[];
  technicianId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  service_category_id?: string; // Added this field to support service category filtering
}

// Customer interfaces related to work orders
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  company: string;
  notes: string;
  created_at: string;
  is_fleet: boolean;
  last_name_first: string;
}

export interface CustomerTableRowData {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    is_fleet: boolean;
    actions: ReactNode;
}

export interface Activity {
  id: string;
  workOrderId: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
}
