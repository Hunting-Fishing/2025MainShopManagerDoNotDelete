
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { WorkOrder, WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Type adapters to help with type conversion between different but similar types
 */

/**
 * Converts an InventoryItem to an InvoiceItem
 */
export function inventoryToInvoiceItem(item: InventoryItem): InvoiceItem {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name,
    description: item.description || "",
    quantity: 1,
    price: item.price || 0,
    total: item.price || 0,
    sku: item.sku,
    category: item.category
  };
}

/**
 * Converts an InvoiceItem to an InventoryItem
 * Note: This is a best-effort conversion and may lose some data
 */
export function invoiceToInventoryItem(item: InvoiceItem): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    sku: item.sku || "",
    category: item.category,
    quantity: item.quantity
  };
}

/**
 * Converts a WorkOrder status to the typed status
 */
export function normalizeWorkOrderStatus(status: string): "pending" | "in-progress" | "completed" | "cancelled" | "on-hold" {
  const validStatuses = ["pending", "in-progress", "completed", "cancelled", "on-hold"];
  return validStatuses.includes(status) ? 
    status as "pending" | "in-progress" | "completed" | "cancelled" | "on-hold" : 
    "pending";
}

/**
 * Ensures the template has both camelCase and snake_case properties
 */
export function normalizeInvoiceTemplate(template: Partial<InvoiceTemplate>): InvoiceTemplate {
  return {
    id: template.id || "",
    name: template.name || "",
    description: template.description || "",
    // Ensure both naming conventions are present
    default_tax_rate: template.default_tax_rate || template.defaultTaxRate || 0,
    default_due_date_days: template.default_due_date_days || template.defaultDueDateDays || 30,
    default_notes: template.default_notes || template.defaultNotes || "",
    created_at: template.created_at || template.createdAt || new Date().toISOString(),
    last_used: template.last_used || template.lastUsed || null,
    usage_count: template.usage_count || template.usageCount || 0,
    // Camel case versions
    defaultTaxRate: template.defaultTaxRate || template.default_tax_rate || 0,
    defaultDueDateDays: template.defaultDueDateDays || template.default_due_date_days || 30,
    defaultNotes: template.defaultNotes || template.default_notes || "",
    createdAt: template.createdAt || template.created_at || new Date().toISOString(),
    lastUsed: template.lastUsed || template.last_used || null,
    usageCount: template.usageCount || template.usage_count || 0,
    defaultItems: template.defaultItems || []
  };
}
