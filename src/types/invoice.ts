
import { Customer } from './customer';
import { WorkOrder } from './workOrder';

// Export StaffMember so it can be used by other components
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

export interface Invoice {
  id: string;
  customer: string;
  customerAddress?: string;
  customerEmail?: string;
  customer_id?: string;
  date: string;
  due_date: string;
  description?: string;
  notes?: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  subtotal?: number;
  tax?: number;
  total?: number;
  workOrderId?: string;
  work_order_id?: string; // Database field name
  createdBy?: string;
  created_by?: string; // Database field name
  lastUpdatedBy?: string;
  last_updated_by?: string; // Database field name
  lastUpdatedAt?: string;
  last_updated_at?: string; // Database field name
  paymentMethod?: string;
  payment_method?: string; // Database field name
  relatedWorkOrder?: WorkOrder; // For joined data
  related_work_order?: WorkOrder; // For database joined data
  created_at?: string;
  // Adding missing fields
  items?: InvoiceItem[];
  assignedStaff?: StaffMember[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
  sku?: string;
  category?: string;
  invoice_id: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  last_used?: string;
  usage_count: number;
  default_tax_rate?: number;
  default_notes?: string;
  default_due_date_days?: number;
  items?: InvoiceItem[];
  // Adding fields used in components
  defaultItems?: InvoiceItem[];
  defaultTaxRate?: number;
  defaultDueDateDays?: number;
  defaultNotes?: string;
}

export type InvoiceUpdater = (field: keyof Invoice, value: any) => void;

export const createInvoiceUpdater = (updater: (invoice: Invoice) => Invoice) =>
  (prev: Invoice) => updater(prev);

// Add the InvoiceFiltersProps interface
export interface InvoiceFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: {
    status: string[];
    dateRange: [Date | null, Date | null];
    minAmount: number;
    maxAmount: number;
    customer: string;
  };
}
