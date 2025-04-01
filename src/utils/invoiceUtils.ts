
import { Invoice, InvoiceItem } from "@/types/invoice";

// Generate a new invoice ID
export function generateInvoiceId(): string {
  return `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}

// Calculate invoice subtotal
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

// Calculate tax amount
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

// Calculate total amount
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

// Create a new default invoice
export function createDefaultInvoice(initialWorkOrderId?: string): Invoice {
  return {
    id: generateInvoiceId(),
    customer: "",
    customerAddress: "",
    customerEmail: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    workOrderId: initialWorkOrderId || "",
    createdBy: "",
    assignedStaff: [],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  };
}
