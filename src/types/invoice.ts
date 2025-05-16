import { Customer } from "./customer";

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
  status: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  work_order_id?: string;
  created_by?: string;
  payment_method?: string;
  items: InvoiceItem[];
  customerData?: Customer;
  created_at?: string;
  assignedStaff: StaffMember[];
  last_updated_by?: string;
  last_updated_at?: string;
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
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  default_items?: InvoiceItem[];
  created_at?: string;
  last_used?: string; 
  usage_count?: number;
}

// Add StaffMember interface
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

// Helper function to create an invoice updater
export interface InvoiceUpdater {
  (prev: Invoice): Invoice;
}

export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};

// Define InvoiceFiltersProps
export interface InvoiceFiltersProps {
  onApplyFilters: (filters: any) => void;
  filters?: any;
  setFilters?: (filters: any) => void;
  resetFilters?: () => void;
}

export interface InvoiceFiltersDropdownProps {
  onApplyFilters: (filters: any) => void;
}
