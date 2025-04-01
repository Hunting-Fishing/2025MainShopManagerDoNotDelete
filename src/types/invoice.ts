
export interface Invoice {
  id: string;
  workOrderId?: string;
  customer: string;
  customerAddress?: string;
  customerEmail?: string;
  description?: string;
  notes?: string;
  total: number;
  subtotal: number;
  tax: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod?: string;
  date: string;
  dueDate: string;
  createdBy?: string;
  assignedStaff?: string[];
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
}

export interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: string;
  date: string;
  dueDate: string;
  priority: string;
  technician: string;
  location: string;
  notes?: string;
  inventoryItems?: WorkOrderInventoryItem[];
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  billable: boolean;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description?: string;
}
