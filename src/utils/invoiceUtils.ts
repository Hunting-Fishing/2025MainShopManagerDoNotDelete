
import { Invoice, InvoiceItem } from "@/types/invoice";

// Get the appropriate color for an invoice status
export const getInvoiceStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border border-gray-300",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    paid: "bg-green-100 text-green-800 border border-green-300",
    overdue: "bg-red-100 text-red-800 border border-red-300",
    cancelled: "bg-pink-100 text-pink-800 border border-pink-300",
    default: "bg-blue-100 text-blue-800 border border-blue-300"
  };

  return statusColors[status] || statusColors.default;
};

// Prepare an invoice for API submission
export const formatInvoiceForApi = (invoice: Invoice): any => {
  return {
    id: invoice.id,
    customer: invoice.customer,
    customer_id: invoice.customer_id,
    customer_email: invoice.customer_email,
    customer_address: invoice.customer_address,
    issue_date: invoice.date,
    due_date: invoice.due_date,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax_rate: invoice.tax_rate,
    tax: invoice.tax,
    total: invoice.total,
    notes: invoice.notes,
    work_order_id: invoice.work_order_id,
    description: invoice.description,
    payment_method: invoice.payment_method,
    created_by: invoice.created_by,
    created_at: invoice.created_at,
    updated_at: new Date().toISOString(),
  };
};

// Format API response to our Invoice type
export const formatApiInvoice = (invoice: any): Invoice => {
  return {
    id: invoice.id,
    number: invoice.number || invoice.id.substring(0, 8).toUpperCase(),
    customer: invoice.customer || "",
    customer_id: invoice.customer_id,
    customer_email: invoice.customer_email || "",
    customer_address: invoice.customer_address || "",
    date: invoice.date || invoice.issue_date || new Date().toISOString(),
    due_date: invoice.due_date || "",
    status: invoice.status || "draft",
    subtotal: Number(invoice.subtotal) || 0,
    tax_rate: Number(invoice.tax_rate) || 0,
    tax: Number(invoice.tax) || 0,
    total: Number(invoice.total) || 0,
    notes: invoice.notes || "",
    work_order_id: invoice.work_order_id || "",
    description: invoice.description || "",
    payment_method: invoice.payment_method || "",
    created_by: invoice.created_by || "",
    created_at: invoice.created_at || new Date().toISOString(),
    updated_at: invoice.updated_at || new Date().toISOString(),
    assignedStaff: invoice.assignedStaff || [],
    items: invoice.items || [],
  };
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number = 0): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};

// Format money value as currency
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
