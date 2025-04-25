
export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  customer: string;
  customerAddress: string;
  customerEmail: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'pending' | 'cancelled';
  items: InvoiceItem[];
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdBy?: string;
  paymentMethod?: string;
  createdAt?: string;
  description?: string;
  workOrderId?: string;
  assignedStaff: StaffMember[];
  customer_id?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
  category?: string;
  sku?: string;
}

export interface InvoiceTemplateItem {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total?: number;
  hours: boolean;
  sku?: string;
  category?: string;
  createdAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  defaultTaxRate: number;
  defaultDueDateDays: number;
  defaultNotes: string;
  createdAt: string;
  usageCount: number;
  lastUsed: string | null;
  defaultItems: InvoiceTemplateItem[];
}

// Define StaffMember interface
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

// Define InventoryItem interface for invoice use
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

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};

// Define invoice filters props for components
export interface InvoiceFiltersProps {
  filters: {
    status: string;
    dateRange: { from: string | null; to: string | null };
    customer: string;
    minAmount: string;
    maxAmount: string;
  };
  onFilterChange: (name: string, value: any) => void;
  onClearFilters: () => void;
}

// Interface for converting invoice items to template items
export const convertToTemplateItems = (items: InvoiceItem[]): InvoiceTemplateItem[] => {
  return items.map(item => ({
    id: item.id,
    templateId: '', // Will be populated when template is created
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
    hours: !!item.hours,
    sku: item.sku,
    category: item.category,
    createdAt: new Date().toISOString()
  }));
};
