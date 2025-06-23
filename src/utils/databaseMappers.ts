
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderPart } from "@/types/workOrderPart";

// Maps our application WorkOrder type to Supabase database format
export const mapToDbWorkOrder = (workOrder: Partial<WorkOrder>) => {
  return {
    id: workOrder.id,
    customer: workOrder.customer,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    date: workOrder.date,
    due_date: workOrder.dueDate,
    technician: workOrder.technician,
    location: workOrder.location,
    notes: workOrder.notes,
    total_billable_time: workOrder.total_billable_time,
    created_at: workOrder.created_at,
    updated_at: workOrder.updated_at
  };
};

// Maps from Supabase to our application WorkOrder format
export const mapFromDbWorkOrder = (dbWorkOrder: any, timeEntries: TimeEntry[] = [], inventoryItems: WorkOrderInventoryItem[] = []): WorkOrder => {
  return {
    id: dbWorkOrder.id,
    customer: dbWorkOrder.customer,
    description: dbWorkOrder.description || '',
    status: dbWorkOrder.status,
    priority: dbWorkOrder.priority,
    date: dbWorkOrder.date,
    dueDate: dbWorkOrder.due_date,
    technician: dbWorkOrder.technician,
    location: dbWorkOrder.location,
    notes: dbWorkOrder.notes || '',
    total_billable_time: dbWorkOrder.total_billable_time || 0,
    created_at: dbWorkOrder.created_at,
    updated_at: dbWorkOrder.updated_at,
    timeEntries,
    inventoryItems
  };
};

// Map time entry from DB format to app format
export const mapTimeEntryFromDb = (entry: any): TimeEntry => ({
  id: entry.id,
  employee_id: entry.employee_id,
  employee_name: entry.employee_name,
  start_time: entry.start_time,
  end_time: entry.end_time,
  duration: entry.duration,
  notes: entry.notes,
  billable: entry.billable,
  work_order_id: entry.work_order_id || '',
  created_at: entry.created_at || new Date().toISOString()
});

// Map inventory item from DB format to app format
export const mapInventoryItemFromDb = (item: any): WorkOrderInventoryItem => ({
  id: item.id,
  name: item.name,
  sku: item.sku,
  category: item.category,
  quantity: item.quantity,
  unit_price: item.unit_price,
  total: item.total || (item.quantity * item.unit_price)
});

// Map database part to WorkOrderPart format
export const mapDatabasePartToWorkOrderPart = (dbPart: any): WorkOrderPart => {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name || '',
    description: dbPart.part_description || dbPart.description || '',
    quantity: dbPart.quantity || 0,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0,
    total_price: (dbPart.customer_price || dbPart.unit_price || 0) * (dbPart.quantity || 0),
    status: dbPart.status || 'pending',
    notes: dbPart.notes_internal || dbPart.notes || '',
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    
    // Additional properties with fallbacks
    partName: dbPart.part_name || dbPart.name,
    partNumber: dbPart.part_number,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    customerPrice: dbPart.customer_price,
    retailPrice: dbPart.retail_price,
    category: dbPart.category,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    binLocation: dbPart.bin_location,
    installDate: dbPart.install_date,
    dateAdded: dbPart.date_added || dbPart.created_at,
    part_type: dbPart.part_type,
    installedBy: dbPart.installed_by,
    markupPercentage: dbPart.markup_percentage,
    inventoryItemId: dbPart.inventory_item_id,
    coreChargeApplied: dbPart.core_charge_applied,
    coreChargeAmount: dbPart.core_charge_amount,
    isTaxable: dbPart.is_taxable,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    attachments: dbPart.attachments,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location
  };
};
