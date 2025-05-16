
import { Invoice } from "@/types/invoice";

// Function to get color classes based on invoice status
export function getInvoiceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return "bg-green-100 text-green-800 border border-green-300";
    case 'overdue':
      return "bg-red-100 text-red-800 border border-red-300";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case 'draft':
      return "bg-gray-100 text-gray-800 border border-gray-300";
    case 'cancelled':
      return "bg-slate-100 text-slate-800 border border-slate-300";
    default:
      return "bg-blue-100 text-blue-800 border border-blue-300";
  }
}

// Format API invoice data to match our Invoice type
export function formatApiInvoice(data: any): Invoice {
  return {
    id: data.id,
    customer: data.customer,
    customer_email: data.customer_email || '',
    customer_address: data.customer_address || '',
    date: data.date,
    due_date: data.due_date,
    subtotal: Number(data.subtotal) || 0,
    tax: Number(data.tax) || 0,
    total: Number(data.total) || 0,
    status: data.status,
    items: data.items || [],
    notes: data.notes,
    description: data.description,
    payment_method: data.payment_method,
    work_order_id: data.work_order_id,
    assignedStaff: data.assignedStaff || [],
    created_by: data.created_by,
    last_updated_by: data.last_updated_by,
    last_updated_at: data.last_updated_at,
    customer_id: data.customer_id,
  };
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return subtotal;
}
