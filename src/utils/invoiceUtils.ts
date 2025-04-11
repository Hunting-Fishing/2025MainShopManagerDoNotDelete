import { Invoice, InvoiceItem, StaffMember } from '@/types/invoice';

// Calculate subtotal for an invoice
export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

// Calculate tax for an invoice
export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * taxRate;
};

// Calculate total for an invoice
export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

// Create a default invoice
export const createDefaultInvoice = (workOrderId?: string): Invoice => {
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30);  // Default to 30 days from now

  return {
    id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    customer: '',
    customerEmail: '',
    customerAddress: '',
    date: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    items: [],
    notes: '',
    description: '',
    paymentMethod: 'card',
    workOrderId: workOrderId || '',
    assignedStaff: []
  };
};

// Get color class for invoice status
export const getInvoiceStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'bg-gray-500 hover:bg-gray-600';
    case 'pending':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'paid':
      return 'bg-green-500 hover:bg-green-600';
    case 'overdue':
      return 'bg-red-500 hover:bg-red-600';
    case 'cancelled':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

// Function to convert API snake_case invoice to camelCase Invoice type
export const formatApiInvoice = (apiInvoice: any): Invoice => {
  return {
    id: apiInvoice.id,
    customer: apiInvoice.customer,
    customerEmail: apiInvoice.customer_email,
    customerAddress: apiInvoice.customer_address,
    date: apiInvoice.date,
    dueDate: apiInvoice.due_date,
    subtotal: apiInvoice.subtotal || 0,
    tax: apiInvoice.tax || 0,
    total: apiInvoice.total || 0,
    status: apiInvoice.status as 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled',
    notes: apiInvoice.notes,
    description: apiInvoice.description,
    paymentMethod: apiInvoice.payment_method,
    customer_id: apiInvoice.customer_id,
    createdBy: apiInvoice.created_by,
    lastUpdatedBy: apiInvoice.last_updated_by,
    workOrderId: apiInvoice.work_order_id,
    assignedStaff: apiInvoice.assignedStaff || []
  };
};
