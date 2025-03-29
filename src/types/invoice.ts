import { InventoryItem } from "./inventory";
import { TimeEntry } from "./workOrder";

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
  timeEntries?: TimeEntry[];
  totalBillableTime?: number;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
}

export interface Invoice {
  id: string;
  customer: string;
  customerAddress: string;
  customerEmail: string;
  description: string;
  notes: string;
  date: string;
  dueDate: string;
  status: string;
  workOrderId: string;
  createdBy: string;
  assignedStaff: string[];
  items: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  createdAt?: string; // Creation timestamp
  lastUpdatedBy?: string; // Person who last updated the invoice
  lastUpdatedAt?: string; // Last update timestamp
}

// New interface for invoice templates
export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  defaultTaxRate: number;
  defaultDueDateDays: number;
  defaultItems: InvoiceItem[];
  defaultNotes?: string;
}

// Functions to update the invoice state
export type InvoiceUpdater = (prev: Invoice) => Invoice;

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>): InvoiceUpdater => {
  return (prev: Invoice) => ({ ...prev, ...updates });
};
