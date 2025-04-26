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

export type createInvoiceUpdater = (
  field: keyof Invoice,
  value: any
) => void;

export interface Invoice {
  id: string;
  customer: string;
  customer_id?: string;
  date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void";
  notes?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  workOrderId?: string;
  description?: string;
  assignedStaff?: StaffMember[];
  paymentMethod?: string;
  items: InvoiceItem[];
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
  lastUsed?: Date | null;
  defaultItems: InvoiceTemplateItem[];
}
