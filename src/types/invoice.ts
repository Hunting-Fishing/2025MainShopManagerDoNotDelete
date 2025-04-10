
import { Dispatch, SetStateAction } from 'react';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  hours?: boolean; // Is this a labor/time entry
  total: number;
}

export type StaffMember = {
  id: string;
  name: string;
};

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
  status: InvoiceStatus;
  paymentMethod?: string;
  date: string;
  dueDate: string;
  createdBy: string;
  assignedStaff: string[];
  items: InvoiceItem[];
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  defaultTaxRate: number;
  defaultDueDateDays: number;
  defaultNotes: string;
  defaultItems: InvoiceItem[];
}

export type InvoiceUpdater = (prev: Invoice) => Invoice;

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>): InvoiceUpdater => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};
