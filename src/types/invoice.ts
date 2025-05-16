
import { Customer } from "./customer";

export interface Invoice {
  id: string;
  customer: string;
  customer_id?: string;
  customer_address?: string;
  customer_email?: string;
  description?: string;
  notes?: string;
  date: string;
  due_date: string;
  status: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  work_order_id?: string;
  created_by?: string;
  payment_method?: string;
  items: InvoiceItem[];
  customerData?: Customer;
  created_at?: string;
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
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  default_items?: InvoiceItem[];
  created_at?: string;
  last_used?: string; 
  usage_count?: number;
}
