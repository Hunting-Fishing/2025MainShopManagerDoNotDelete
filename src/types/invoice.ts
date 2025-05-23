
export interface Invoice {
  id: string;
  number: string;
  customer_id: string;
  customer: string;
  date: string;
  due_date: string;
  issue_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  subtotal: number;
  tax: number;
  tax_rate: number;
  total: number;
  created_at: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}
