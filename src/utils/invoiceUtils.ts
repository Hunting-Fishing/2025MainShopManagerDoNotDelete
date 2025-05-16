
import { Invoice, InvoiceItem } from "@/types/invoice";

/**
 * Format API response invoice to match frontend Invoice type
 */
export const formatApiInvoice = (apiInvoice: any): Invoice => {
  // Convert snake_case properties to camelCase
  return {
    ...apiInvoice,
    workOrderId: apiInvoice.work_order_id,
    relatedWorkOrder: apiInvoice.related_work_order,
    customerAddress: apiInvoice.customer_address,
    customerEmail: apiInvoice.customer_email,
    createdBy: apiInvoice.created_by,
    lastUpdatedBy: apiInvoice.last_updated_by,
    lastUpdatedAt: apiInvoice.last_updated_at,
    paymentMethod: apiInvoice.payment_method,
  };
};

/**
 * Format frontend invoice to match API expectations
 */
export const formatInvoiceForApi = (invoice: Invoice): any => {
  return {
    ...invoice,
    work_order_id: invoice.workOrderId,
    related_work_order: invoice.relatedWorkOrder,
    customer_address: invoice.customerAddress,
    customer_email: invoice.customerEmail,
    created_by: invoice.createdBy,
    last_updated_by: invoice.lastUpdatedBy,
    last_updated_at: invoice.lastUpdatedAt,
    payment_method: invoice.paymentMethod,
  };
};

/**
 * Calculate subtotal from invoice items
 */
export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

/**
 * Calculate tax from subtotal and tax rate
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * taxRate;
};

/**
 * Calculate total from subtotal and tax
 */
export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

/**
 * Get color for invoice status
 */
export const getInvoiceStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    "paid": "text-green-800 bg-green-100",
    "pending": "text-yellow-800 bg-yellow-100",
    "overdue": "text-red-800 bg-red-100",
    "draft": "text-gray-800 bg-gray-100",
    "cancelled": "text-red-800 bg-red-100",
  };
  
  return statusColors[status] || "text-gray-800 bg-gray-100";
};
