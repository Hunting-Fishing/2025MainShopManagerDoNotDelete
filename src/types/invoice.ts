
import { Customer } from './customer';
import { WorkOrder } from './workOrder';
import { StaffMember } from './staff';

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
}

export type InvoiceUpdater = (field: keyof Invoice, value: any) => void;

export const createInvoiceUpdater = (updater: (invoice: Invoice) => Invoice) =>
  (prev: Invoice) => updater(prev);
