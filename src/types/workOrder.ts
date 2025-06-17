
import { CustomerVehicle } from './customer';

export type WorkOrderStatusType = 
  | 'draft'
  | 'submitted'
  | 'scheduled'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'invoiced'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export interface WorkOrder {
  id: string;
  customer_id?: string;
  vehicle_id?: string;
  status: WorkOrderStatusType;
  description?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  technician?: string;
  technician_id?: string;
  location?: string;
  due_date?: string;
  dueDate?: string;
  created_at?: string;
  updated_at?: string;
  
  // Customer information (denormalized for display)
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  
  // Vehicle information (denormalized for display)
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string;
  
  // Inventory items linked to this work order
  inventoryItems?: WorkOrderInventoryItem[];
  inventory_items?: WorkOrderInventoryItem[];
}

export interface WorkOrderInventoryItem {
  id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
  description?: string;
  category?: string;
  supplier?: string;
  supplierName?: string; // Added this field
  location?: string;
  estimatedArrivalDate?: string; // Added this field
  notes?: string;
  status?: 'ordered' | 'received' | 'installed' | 'returned';
}

export interface TimeEntry {
  id?: string;
  work_order_id?: string;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time?: string;
  duration: number;
  billable?: boolean;
  notes?: string;
  created_at?: string;
}

export interface WorkOrderCreate {
  customer_id?: string;
  vehicle_id?: string;
  status: WorkOrderStatusType;
  description?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  technician?: string;
  technician_id?: string;
  location?: string;
  due_date?: string;
  
  // Customer information
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  
  // Vehicle information
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string;
  
  // Inventory items
  inventoryItems?: WorkOrderInventoryItem[];
}

export interface WorkOrderUpdate {
  id: string;
  customer_id?: string;
  vehicle_id?: string;
  status?: WorkOrderStatusType;
  description?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  technician?: string;
  technician_id?: string;
  location?: string;
  due_date?: string;
  
  // Customer information
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  
  // Vehicle information
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_vin?: string;
  vehicle_license_plate?: string;
  vehicle_odometer?: string;
  
  // Inventory items
  inventoryItems?: WorkOrderInventoryItem[];
}
