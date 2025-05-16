
import { Customer } from './customer';
import { WorkOrder } from './workOrder';
import { InventoryItem } from './inventory';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
  sku?: string;
  category?: string;
}

export interface Invoice {
  id: string;
  shop_id: string;
  customer: Customer;
  customer_id?: string;
  customerEmail?: string;
  customerAddress?: string;
  date?: string;
  dueDate?: string;
  work_order?: WorkOrder;
  workOrderId?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'pending' | 'cancelled';
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  tax?: number;
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
  description?: string;
  createdBy?: string;
  paymentMethod?: string;
  assignedStaff?: StaffMember[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface ApiInvoice {
  id: string;
  shop_id: string;
  customer_id: string;
  work_order_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'pending' | 'cancelled';
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer: Customer;
  work_order?: WorkOrder;
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
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

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};
