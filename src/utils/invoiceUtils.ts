
import { Invoice } from "@/types/invoice";

/**
 * Format an API invoice response to our Invoice type
 */
export const formatApiInvoice = (data: any): Invoice => {
  if (!data) return {} as Invoice;
  
  const invoice: Invoice = {
    ...data,
    // Map any missing fields
    dueDate: data.due_date,
    paymentMethod: data.payment_method,
    createdBy: data.created_by,
    shop_id: data.shop_id || "" // Ensure shop_id is never undefined
  };
  
  return invoice;
};

/**
 * Get color class based on invoice status
 */
export const getInvoiceStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'void':
      return 'bg-slate-100 text-slate-800';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};
