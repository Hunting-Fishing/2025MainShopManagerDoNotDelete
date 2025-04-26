
export interface Invoice {
  id: string;
  customer: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  due_date?: string; // Added for compatibility with API
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  description?: string;
  paymentMethod?: string;
  workOrderId?: string;
  assignedStaff: StaffMember[];
  createdBy: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  customer_id?: string;
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
  templateId?: string;
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
  usage_count: number;
  createdAt?: string;
  created_at?: string;
  lastUsed?: string;
  last_used?: string;
  defaultItems?: InvoiceItem[];
}

export interface InvoiceTemplateItem extends InvoiceItem {
  templateId: string;
  createdAt: string;
}

export interface InvoiceFiltersProps {
  filters: any;
  onFilterChange?: (filters: any) => void;
  setFilters?: (filters: any) => void;
  resetFilters?: () => void;
}

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};

// Helper function to convert invoice items to template items
export const convertToTemplateItems = (items: InvoiceItem[]): InvoiceTemplateItem[] => {
  return items.map(item => ({
    ...item,
    templateId: 'pending-id',
    createdAt: new Date().toISOString()
  }));
};
