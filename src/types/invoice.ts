
export interface Invoice {
  id: string;
  number: string;
  customer: string;
  customer_id?: string;
  customer_address?: string;
  customer_email?: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  tax_rate: number;
  total: number;
  notes: string;
  work_order_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignedStaff: StaffMember[];
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  hours?: boolean;
  category?: string;
  sku?: string;
  name?: string;
  total?: number;
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
  default_items?: InvoiceItem[];
  default_tax_rate?: number;
  default_notes?: string;
  default_due_date_days?: number;
  created_at?: string;
  last_used?: string;
  usage_count?: number;
}

export const createInvoiceUpdater = (updates: Partial<Invoice>) => {
  return (prevInvoice: Invoice): Invoice => ({
    ...prevInvoice,
    ...updates
  });
};
