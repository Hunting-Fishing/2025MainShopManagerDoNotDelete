
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
  paymentMethod: string; // Changed from optional to required
  date: string;
  dueDate: string;
  createdBy?: string;
  assignedStaff?: string[];
  items: InvoiceItem[];
  // Additional fields needed by components
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
  // Make hours optional
  hours?: boolean;
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

// Import WorkOrder from workOrder.ts instead of redefining it
import { WorkOrder as WorkOrderType, WorkOrderInventoryItem, TimeEntry } from './workOrder';
// Re-export the imported type
export type WorkOrder = WorkOrderType;

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
