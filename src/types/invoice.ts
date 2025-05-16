
import { WorkOrder } from './workOrder';

export interface Invoice {
  id: string;
  customer: string;
  customer_id?: string;
  customer_address?: string;
  customer_email?: string;
  description?: string;
  notes?: string;
  date: string;
  due_date: string; // Snake case for consistency
  status: 'pending' | 'cancelled' | 'draft' | 'paid' | 'overdue';
  subtotal?: number;
  tax?: number;
  total?: number;
  work_order_id?: string; // ID reference to related work order
  created_by?: string;
  payment_method?: string;
  last_updated_by?: string;
  last_updated_at?: string;
  created_at?: string;
  items?: InvoiceItem[]; // Added items array 
  assignedStaff?: StaffMember[]; // Staff assigned to the invoice
  relatedWorkOrder?: WorkOrder; // For accessing full work order details
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total?: number;
  hours?: boolean;
  sku?: string; // Make SKU optional for invoice items
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_notes?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  created_at?: string;
  last_used?: string;
  usage_count?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

// Create invoice updater type
export const createInvoiceUpdater = (update: Partial<Invoice>) => 
  (invoice: Invoice): Invoice => ({
    ...invoice,
    ...update
  });

// Invoice filters type
export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    }
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}
