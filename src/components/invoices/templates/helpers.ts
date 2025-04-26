
import { InvoiceItem } from "@/types/invoice";

// Define InvoiceTemplateItem directly in this file if it doesn't exist in types
interface InvoiceTemplateItem extends InvoiceItem {
  templateId: string;
  createdAt: string;
}

/**
 * Convert regular invoice items to template items
 */
export function adaptInvoiceItemsToTemplateItems(
  items: InvoiceItem[], 
  templateId: string
): InvoiceTemplateItem[] {
  return items.map(item => ({
    ...item,
    templateId,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Convert template items back to regular invoice items
 */
export function adaptTemplateItemsToInvoiceItems(
  templateItems: InvoiceTemplateItem[]
): InvoiceItem[] {
  return templateItems.map(({ templateId, createdAt, ...item }) => item);
}
