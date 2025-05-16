
import { InvoiceItem } from "@/types/invoice";

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => total + (item.total || 0), 0);
};

export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};
