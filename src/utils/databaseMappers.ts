
import { WorkOrderPart } from '@/types/workOrderPart';

export function mapDatabasePartToWorkOrderPart(dbPart: any): WorkOrderPart {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id || undefined,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name,
    description: dbPart.part_description || dbPart.description,
    quantity: dbPart.quantity || 0,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.quantity || 0) * (dbPart.customer_price || dbPart.unit_price || 0),
    status: dbPart.status || 'pending',
    notes: dbPart.notes_internal || dbPart.notes,
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    category: dbPart.category,
    part_type: dbPart.part_type,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    retailPrice: dbPart.retail_price,
    markupPercentage: dbPart.markup_percentage,
    isTaxable: dbPart.is_taxable,
    coreChargeAmount: dbPart.core_charge_amount,
    coreChargeApplied: dbPart.core_charge_applied,
    warrantyDuration: dbPart.warranty_duration,
    invoiceNumber: dbPart.invoice_number,
    isStockItem: dbPart.is_stock_item,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    inventoryItemId: dbPart.inventory_item_id,
    estimatedArrivalDate: dbPart.estimated_arrival_date,
    itemStatus: dbPart.item_status
  };
}
