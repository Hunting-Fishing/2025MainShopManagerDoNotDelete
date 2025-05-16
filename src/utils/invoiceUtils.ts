
import { Invoice } from "@/types/invoice";

export const calculateSubtotal = (items: any[]) => {
  return items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQuantity = parseFloat(item.quantity) || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
};

export const calculateTax = (subtotal: number, taxRate: number) => {
  return subtotal * taxRate;
};

export const calculateTotal = (subtotal: number, tax: number) => {
  return subtotal + tax;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const normalizeInvoice = (invoice: any): Invoice => {
  return {
    id: invoice.id,
    number: invoice.number,
    customer: invoice.customer,
    customer_id: invoice.customer_id,
    customer_email: invoice.customer_email,
    customer_address: invoice.customer_address,
    issue_date: invoice.date || invoice.issue_date || new Date().toISOString(), // Ensure issue_date is set
    date: invoice.date,
    due_date: invoice.due_date,
    status: invoice.status,
    subtotal: parseFloat(invoice.subtotal) || 0,
    tax_rate: parseFloat(invoice.tax_rate) || 0,
    tax: parseFloat(invoice.tax) || 0,
    total: parseFloat(invoice.total) || 0,
    notes: invoice.notes,
    work_order_id: invoice.work_order_id,
    created_by: invoice.created_by,
    payment_method: invoice.payment_method,
    last_updated_by: invoice.last_updated_by,
    created_at: invoice.created_at,
    last_updated_at: invoice.last_updated_at,
    items: invoice.items || [],
    assignedStaff: invoice.assignedStaff || []
  };
};
