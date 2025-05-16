
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'pending' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  hours?: boolean;
  total: number;
  sku?: string;
  category?: string;
}

export interface Invoice {
  id: string;
  shop_id: string;
  customer: string;
  customer_id?: string;
  customerEmail?: string;
  customerAddress?: string;
  description?: string;
  notes?: string;
  date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal?: number;
  tax?: number;
  total?: number;
  workOrderId?: string;
  work_order_id?: string;
  created_at?: string;
  last_updated_at?: string;
  created_by?: string;
  payment_method?: string;
  last_updated_by?: string;
  items?: InvoiceItem[];
  assignedStaff?: StaffMember[];
  
  // Added properties that are used in the codebase
  dueDate?: string;      // Alias for due_date
  paymentMethod?: string; // Alias for payment_method
  createdBy?: string;    // Alias for created_by
  invoice_number?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  created_at?: string;
  last_used?: string;
  usage_count?: number;
  items?: InvoiceItem[];
  defaultItems?: InvoiceItem[]; // Alias for items
  usageCount?: number;        // Alias for usage_count
  lastUsed?: string;          // Alias for last_used
}

// Add the StaffMember interface that was missing
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

// Add the InventoryItem interface
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  category?: string;
  supplier?: string;
  status?: string;
  quantity?: number;
}

// Add InvoiceUpdater interface
export interface InvoiceUpdater {
  id: string;
  [key: string]: any;
}

// Helper function to create an invoice updater
export function createInvoiceUpdater(updates: Partial<Invoice>): InvoiceUpdater {
  if (!updates.id) {
    throw new Error("Invoice updater requires an id");
  }
  
  return {
    id: updates.id,
    ...updates
  };
}

// Add InvoiceFiltersProps interface
export interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (key: keyof InvoiceFilters, value: any) => void;
  onResetFilters: () => void;
}

export interface InvoiceFilters {
  status: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  customerName: string;
  minAmount: number | undefined;
  maxAmount: number | undefined;
}
