
export interface Invoice {
  id: string;
  workOrderId?: string;
  customer: string;
  customerAddress?: string;
  customerEmail?: string;
  customer_id?: string;
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
  // Additional fields needed by components
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
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

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  defaultTaxRate: number;
  defaultDueDateDays: number;
  defaultNotes?: string;
  defaultItems: InvoiceItem[];
}

// Define a type for WorkOrder to prevent conflicts with other exports
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

export type InvoiceUpdater = (prev: Invoice) => Invoice;

// Helper function to create an invoice updater function
export function createInvoiceUpdater(updates: Partial<Invoice>): InvoiceUpdater {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
}
