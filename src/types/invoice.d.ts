
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
