
import { Customer } from './customer';
import { WorkOrder } from './workOrder';
import { InventoryItem } from './inventory';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  hours?: boolean;
}

export interface Invoice {
  id: string;
  shop_id: string;
  customer: Customer;
  work_order?: WorkOrder;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface ApiInvoice {
  id: string;
  shop_id: string;
  customer_id: string;
  work_order_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_rate?: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer: Customer;
  work_order?: WorkOrder;
}
