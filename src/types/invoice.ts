
// Basic type definitions for invoices
export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_rate?: number;
  unit?: string;
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
  status: string;
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  notes?: string;
  work_order_id?: string;
  created_by?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  items: InvoiceItem[];
  assignedStaff?: any[];
}
