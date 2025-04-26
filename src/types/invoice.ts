
export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
    minAmount?: string;
    maxAmount?: string;
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
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
  quantity: number;
  unitPrice: number;
  category?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
  category?: string;
  hours?: boolean;
}

export function createInvoiceUpdater(updates: Partial<Invoice>) {
  return (prev: Invoice) => ({
    ...prev,
    ...updates
  });
}

export interface Invoice {
  id: string;
  customer: string;
  customer_id?: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "pending" | "cancelled";
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  workOrderId?: string;
  description?: string;
  assignedStaff: StaffMember[];
  createdBy: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  paymentMethod?: string;
  items: InvoiceItem[];
  
  // For backwards compatibility and easier code updates
  get dueDate(): string {
    return this.due_date;
  }
  
  set dueDate(value: string) {
    this.due_date = value;
  }
}

export interface InvoiceTemplateItem extends InvoiceItem {
  templateId: string;
  createdAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  defaultNotes?: string;
  defaultDueDateDays?: number;
  defaultTaxRate?: number;
  createdAt: string;
  usageCount?: number;
  lastUsed?: string | null;
  defaultItems: InvoiceTemplateItem[];
}

// Function to convert invoice items to template items
export function convertToTemplateItems(items: InvoiceItem[]): InvoiceTemplateItem[] {
  return items.map(item => ({
    ...item,
    templateId: 'pending-id',
    createdAt: new Date().toISOString()
  }));
}
