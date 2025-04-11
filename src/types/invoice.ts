
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
  sku?: string;
  category?: string;
}

// Interface for InventoryItem in invoice context
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  status?: string;
  supplier?: string;
  sku?: string;
  category?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

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
  assignedStaff: StaffMember[];
  items: InvoiceItem[];
  customer_id?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
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

export interface WorkOrder {
  id: string;
  customer_id: string;
  customer_name: string;
  vehicle_id: string;
  vehicle_info: string;
  status: string;
  description: string;
  total_cost: number;
}

export type InvoiceUpdater = (prev: Invoice) => Invoice;

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>): InvoiceUpdater => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};

export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}
