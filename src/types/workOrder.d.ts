import { ReactNode } from 'react';

// Add this type if it doesn't exist yet
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

export interface WorkOrder {
  id: string;
  customer_id: string;
  customer: string;
  location: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  technician_id: string;
  technician: string;
  date: string;
  dueDate: string;
  notes: string;
  inventoryItems: WorkOrderInventoryItem[];
  timeEntries: TimeEntry[];
  lastUpdatedAt: string;
  totalBillableTime: number;
  startTime?: string;
  endTime?: string;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  itemStatus?: "in-stock" | "special-order" | "out-of-stock";
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  duration: number;
  billable: boolean;
  notes?: string;
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  technician: string;
  notes: string;
  inventoryItems: WorkOrderInventoryItem[];
  createdAt: string;
  usageCount: number;
  lastUsed?: string;
}

export interface Activity {
  id: string;
  workOrderId: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
}

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
