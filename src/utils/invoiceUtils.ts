
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
