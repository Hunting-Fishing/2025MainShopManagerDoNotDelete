
import { InvoiceItem, InvoiceTemplateItem } from "@/types/invoice";

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
