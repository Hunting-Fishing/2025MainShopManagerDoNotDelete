
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
  shop_id?: string;
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
  assignedStaff?: any[];
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
}

// Add the InventoryItem type that was previously missing
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
