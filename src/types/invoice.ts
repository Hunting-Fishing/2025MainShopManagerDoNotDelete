
export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  customer: string;
  customerAddress?: string;
  customerEmail?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  items: InvoiceItem[];
  taxRate?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  createdBy?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  hours?: boolean;
  category?: string;
  sku?: string;
  total?: number;
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
  lastUsed: string;
  defaultItems: InvoiceTemplateItem[];
}
