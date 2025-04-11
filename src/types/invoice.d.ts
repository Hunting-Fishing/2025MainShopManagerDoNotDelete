
export interface Invoice {
  id: string;
  customer: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  dueDate: string;
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
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

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

// Helper function to create an invoice updater
export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
};
