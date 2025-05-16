
// Basic type definitions for invoices
export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_rate?: number;
  unit?: string;
  hours?: boolean;
  category?: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  customer_id: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  date?: string;
  due_date: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  notes?: string;
  description?: string;
  work_order_id?: string;
  created_by?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  items: InvoiceItem[];
  assignedStaff?: StaffMember[];
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  default_items?: InvoiceItem[];
  created_at: string;
  usage_count: number;
  last_used?: string | null;
}

export interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: Partial<InvoiceFilters>) => void;
  onApplyFilters?: (filters: any) => void;
  setFilters?: (filters: any) => void;
  resetFilters?: () => void;
}

export interface InvoiceFiltersDropdownProps {
  filters?: InvoiceFilters;
  onFilterChange?: (filters: Partial<InvoiceFilters>) => void;
  onResetFilters?: () => void;
  onApplyFilters: (filters: any) => void;
}

export interface InvoiceFilters {
  status?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  customer?: string;
  minAmount?: string;
  maxAmount?: string;
}

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};
