
import { DateRange } from "react-day-picker";
import { WorkOrder } from "./workOrder";
import { InventoryItem } from "./inventory";

export interface Invoice {
  id: string;
  customer: string;
  customer_id?: string;
  customer_address?: string;
  customer_email?: string;
  description?: string;
  notes?: string;
  date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'void' | 'sent';
  subtotal?: number;
  tax?: number;
  total?: number;
  created_at?: string;
  last_updated_at?: string;
  work_order_id?: string;
  payment_method?: string;
  created_by?: string;
  last_updated_by?: string;
  shop_id: string;
  
  // Aliases for convenience
  createdAt?: string;
  dueDate?: string;
  paymentMethod?: string;
  
  // Extended properties for UI
  items?: InvoiceItem[];
  assignedStaff?: StaffMember[];
  workOrderId?: string;
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
  description?: string;
  default_tax_rate: number;
  default_due_date_days: number;
  default_notes?: string;
  created_at?: string;
  last_used?: string;
  usage_count?: number;
  
  // Aliases for convenience
  createdAt?: string;
  lastUsed?: string;
  usageCount?: number;
  defaultTaxRate?: number;
  defaultDueDateDays?: number;
  defaultNotes?: string;
  defaultItems?: InvoiceItem[];
}

export interface StaffMember {
  id: string;
  name: string;
}

export interface InvoiceFilters {
  status: string[];
  customerName: string;
  minAmount?: number;
  maxAmount?: number;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (field: keyof InvoiceFilters, value: any) => void;
  onResetFilters: () => void;
}

export type InvoiceUpdater = (prev: Invoice) => Invoice;

export const createInvoiceUpdater = (updates: Partial<Invoice>): InvoiceUpdater => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};
